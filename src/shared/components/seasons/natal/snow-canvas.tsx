'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { makeFlakeSprite } from './flake-sprite'
import { createFlakes, type Flake, flakeCount, stepFlakes } from './snowfall'

const MAX_DPR = 2
const MAX_STEP_MS = 50
/** With reduced motion a lighter, still layer is drawn once. */
const STILL_SHARE = 0.4

/** A drawn flake is this many times its radius: a soft core with a faded rim. */
const FLAKE_SCALE = 4.4

function readColor() {
  const styles = getComputedStyle(document.documentElement)
  return (
    styles.getPropertyValue('--season-snow').trim() ||
    styles.getPropertyValue('--foreground').trim() ||
    '#ffffff'
  )
}

/**
 * Snow over the whole site. It never takes a click (pointer-events-none) and
 * flakes slide away from the pointer; the canvas sits under the header and Vega.
 */
export function SnowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const still = prefersReducedMotion()
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let width = 0
    let height = 0
    let flakes: Flake[] = []
    let frame = 0
    let last = 0
    let sprite = makeFlakeSprite(readColor())
    let colorStale = false
    let pointer: { x: number; y: number } | null = null

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!flakes.length || rect.width !== width) {
        const count = flakeCount(rect.width, rect.height, coarse)
        flakes = createFlakes(
          still ? Math.round(count * STILL_SHARE) : count,
          rect.width,
          rect.height,
        )
      } else if (height) {
        // Phones resize when the URL bar slides mid-scroll: keep the snow where it is.
        const ratio = rect.height / height
        for (const f of flakes) f.y *= ratio
      }
      width = rect.width
      height = rect.height
    }

    const draw = () => {
      if (colorStale) {
        sprite = makeFlakeSprite(readColor())
        colorStale = false
      }
      ctx.clearRect(0, 0, width, height)
      for (const f of flakes) {
        const size = f.r * FLAKE_SCALE
        ctx.globalAlpha = f.alpha
        ctx.drawImage(sprite, f.x - size / 2, f.y - size / 2, size, size)
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      frame = 0
      if (document.hidden) return
      const dt = last ? Math.min(now - last, MAX_STEP_MS) : 16
      last = now
      stepFlakes(flakes, dt, width, height, pointer)
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
    // Touch panning cancels pointer events, so a finger is followed through touchmove.
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) pointer = { x: touch.clientX, y: touch.clientY }
    }
    const onTouchEnd = () => {
      pointer = null
    }
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) pointer = null
    }
    // Only a real theme change re-reads the color: smooth scroll toggles classes on
    // <html> at every scroll start and stop.
    const themeOf = (classes: string | null) => /\b(light|dark)\b/.exec(classes ?? '')?.[1]
    const theme = new MutationObserver((records) => {
      const changed = records.some(
        (record) =>
          record.attributeName !== 'class' ||
          themeOf(record.oldValue) !== themeOf(document.documentElement.className),
      )
      if (!changed) return
      colorStale = true
      if (still) draw()
    })

    resize()
    if (still) draw()
    else start()

    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-color-theme', 'data-season'],
      attributeOldValue: true,
    })
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerout', onPointerOut)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      theme.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas with no tabindex.
    <canvas
      ref={ref}
      aria-hidden="true"
      data-snow
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  )
}
