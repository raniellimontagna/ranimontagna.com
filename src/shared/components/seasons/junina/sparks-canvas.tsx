'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { createSparks, glow, type Spark, sparksCount, stepSparks } from './sparks'

const MAX_DPR = 2
const MAX_STEP_MS = 50

function readPalette(): string[] {
  const styles = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  return [read('--season-fire', '#fb923c'), read('--season-yellow', '#ffd23f')]
}

/**
 * Sparks from a bonfire below the page, drifting up and dying out before the top. They
 * never take a click and slide away from the pointer.
 */
export function SparksCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const still = prefersReducedMotion()
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let width = 0
    let height = 0
    let sparks: Spark[] = []
    let frame = 0
    let last = 0
    let palette = readPalette()
    let pointer: { x: number; y: number } | null = null

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!sparks.length || rect.width !== width) {
        const count = sparksCount(rect.width, rect.height, coarse)
        sparks = createSparks(
          still ? Math.round(count / 2) : count,
          rect.width,
          rect.height,
          Math.random,
        )
      }
      width = rect.width
      height = rect.height
    }
    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const s of sparks) {
        const a = glow(s)
        ctx.fillStyle = palette[s.color % palette.length]
        ctx.globalAlpha = a * 0.25
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = a
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    const loop = (now: number) => {
      frame = 0
      if (document.hidden) return
      const dt = last ? Math.min(now - last, MAX_STEP_MS) : 16
      last = now
      stepSparks(sparks, dt, width, height, pointer, Math.random)
      draw()
      frame = requestAnimationFrame(loop)
    }
    const start = () => {
      if (still || frame || document.hidden) return
      last = 0
      frame = requestAnimationFrame(loop)
    }
    const onResize = () => {
      resize()
      if (still) draw()
    }
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
      } else start()
    }
    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
    }
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) pointer = { x: touch.clientX, y: touch.clientY }
    }
    const onLeave = () => {
      pointer = null
    }
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) pointer = null
    }
    // Only a real theme change re-reads the colours (smooth scroll toggles classes).
    const themeOf = (classes: string | null) => /\b(light|dark)\b/.exec(classes ?? '')?.[1]
    const theme = new MutationObserver((records) => {
      const changed = records.some(
        (record) =>
          record.attributeName !== 'class' ||
          themeOf(record.oldValue) !== themeOf(document.documentElement.className),
      )
      if (!changed) return
      palette = readPalette()
      if (still) draw()
    })

    resize()
    if (still) draw()
    else start()
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-color-theme'],
      attributeOldValue: true,
    })
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerout', onPointerOut)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      theme.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas with no tabindex.
    <canvas
      ref={ref}
      aria-hidden="true"
      data-sparks
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  )
}
