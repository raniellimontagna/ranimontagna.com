'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { type Bat, batFrom, spawnFlight, stepBats, wingLift } from './bats'
import { batsBus } from './bats-bus'

const MAX_DPR = 2
const MAX_STEP_MS = 50
/** A flight now and then: every 15–25 s, 25–35 s on phones. */
const EVERY_MS: [number, number] = [15_000, 25_000]
const PHONE_MS: [number, number] = [25_000, 35_000]

function drawBat(ctx: CanvasRenderingContext2D, bat: Bat) {
  const s = bat.size
  const lift = wingLift(bat) * s * 0.55
  ctx.save()
  ctx.translate(bat.x, bat.y)
  if (bat.vx < 0) ctx.scale(-1, 1)
  ctx.beginPath()
  // Left wing, body, right wing: one silhouette.
  ctx.moveTo(-s * 0.15, 0)
  ctx.quadraticCurveTo(-s * 0.6, -lift - s * 0.2, -s * 1.1, -lift)
  ctx.quadraticCurveTo(-s * 0.8, -lift * 0.3 + s * 0.15, -s * 0.55, s * 0.12)
  ctx.quadraticCurveTo(-s * 0.35, s * 0.05, -s * 0.15, s * 0.25)
  ctx.lineTo(s * 0.15, s * 0.25)
  ctx.quadraticCurveTo(s * 0.35, s * 0.05, s * 0.55, s * 0.12)
  ctx.quadraticCurveTo(s * 0.8, -lift * 0.3 + s * 0.15, s * 1.1, -lift)
  ctx.quadraticCurveTo(s * 0.6, -lift - s * 0.2, s * 0.15, 0)
  ctx.lineTo(s * 0.1, -s * 0.28)
  ctx.lineTo(0, -s * 0.12)
  ctx.lineTo(-s * 0.1, -s * 0.28)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/**
 * Bats over the whole site, now and then: a small flight crosses the screen, flapping,
 * and veers away from the pointer. Decoration only: never takes a click, never flies with
 * reduced motion or in a hidden tab. The loop runs only while a bat is in the air.
 */
export function BatsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || prefersReducedMotion()) return

    const phone = window.matchMedia('(pointer: coarse)').matches
    let width = 0
    let height = 0
    let bats: Bat[] = []
    let frame = 0
    let last = 0
    let timer = 0
    let pointer: { x: number; y: number } | null = null
    const readColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--season-bat').trim() ||
      '#c084fc'
    let color = readColor()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = color
      ctx.globalAlpha = 0.9
      for (const bat of bats) drawBat(ctx, bat)
      ctx.globalAlpha = 1
    }
    const loop = (now: number) => {
      frame = 0
      if (document.hidden) return
      const dt = last ? Math.min(now - last, MAX_STEP_MS) : 16
      last = now
      bats = stepBats(bats, dt, width, height, pointer)
      draw()
      if (bats.length) frame = requestAnimationFrame(loop)
    }
    const wake = () => {
      if (frame || document.hidden) return
      last = 0
      frame = requestAnimationFrame(loop)
    }
    const schedule = () => {
      window.clearTimeout(timer)
      if (document.hidden) return
      const [min, max] = phone ? PHONE_MS : EVERY_MS
      timer = window.setTimeout(
        () => {
          bats = [...bats, ...spawnFlight(width, height, Math.random)]
          wake()
          schedule()
        },
        min + Math.random() * (max - min),
      )
    }
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
        window.clearTimeout(timer)
      } else {
        wake()
        schedule()
      }
    }
    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
    }
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) pointer = null
    }
    // Touch panning cancels pointer events, so a finger is followed through touchmove.
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) pointer = { x: touch.clientX, y: touch.clientY }
    }
    const onTouchEnd = () => {
      pointer = null
    }
    // Only a real theme change re-reads the colour (smooth scroll toggles classes).
    const themeOf = (classes: string | null) => /\b(light|dark)\b/.exec(classes ?? '')?.[1]
    const theme = new MutationObserver((records) => {
      const changed = records.some(
        (record) =>
          record.attributeName !== 'class' ||
          themeOf(record.oldValue) !== themeOf(document.documentElement.className),
      )
      if (changed) color = readColor()
    })
    const unsubscribe = batsBus.subscribe(({ x, y }) => {
      bats = [...bats, batFrom(x, y, Math.random)]
      wake()
    })

    resize()
    schedule()
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-color-theme'],
      attributeOldValue: true,
    })
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerout', onPointerOut)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      unsubscribe()
      theme.disconnect()
      window.removeEventListener('resize', resize)
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
      data-bats
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  )
}
