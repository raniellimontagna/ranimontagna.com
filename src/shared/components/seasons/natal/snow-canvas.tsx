'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { createFlakes, type Flake, flakeCount, stepFlakes } from './snowfall'

const MAX_DPR = 2
const MAX_STEP_MS = 50
/** With reduced motion a lighter, still layer is drawn once. */
const STILL_SHARE = 0.4

function readColor() {
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#ffffff'
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
    let color = readColor()
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
        color = readColor()
        colorStale = false
      }
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = color
      for (const f of flakes) {
        ctx.globalAlpha = f.alpha
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
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
    <canvas
      ref={ref}
      aria-hidden="true"
      data-snow
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  )
}
