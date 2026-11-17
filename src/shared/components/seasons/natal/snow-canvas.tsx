'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { createFlakes, type Flake, flakeCount, stepFlakes } from './snowfall'

const MAX_DPR = 2
const MAX_STEP_MS = 50
/** With reduced motion a lighter, still layer is drawn once. */
const STILL_SHARE = 0.4

const SPRITE = 32
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

/** The same color fully transparent, so the rim fades without a dark fringe. */
function clear(color: string) {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color)
  if (!hex) return 'rgba(255, 255, 255, 0)'
  const [r, g, b] = hex.slice(1).map((part) => Number.parseInt(part, 16))
  return `rgba(${r}, ${g}, ${b}, 0)`
}

/** One soft flake, drawn once and stamped for every flake: cheaper than blur per frame. */
function makeSprite(color: string) {
  const sprite = document.createElement('canvas')
  sprite.width = SPRITE
  sprite.height = SPRITE
  const ctx = sprite.getContext('2d')
  if (!ctx) return sprite
  const half = SPRITE / 2
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.4, color)
  gradient.addColorStop(1, clear(color))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SPRITE, SPRITE)
  return sprite
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
    let sprite = makeSprite(readColor())
    let colorStale = false
    let pointer: { x: number; y: number } | null = null

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = flakeCount(width, height, coarse)
      flakes = createFlakes(still ? Math.round(count * STILL_SHARE) : count, width, height)
    }

    const draw = () => {
      if (colorStale) {
        sprite = makeSprite(readColor())
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
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) pointer = null
    }
    const theme = new MutationObserver(() => {
      colorStale = true
      if (still) draw()
    })

    resize()
    if (still) draw()
    else start()

    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-color-theme', 'data-season'],
    })
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerout', onPointerOut)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      theme.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerout', onPointerOut)
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
