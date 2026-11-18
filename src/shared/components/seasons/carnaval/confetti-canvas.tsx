'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { isEmptySpot } from '../shared/empty-spot'
import { playWhistle } from './carnaval-sound'
import { burstConfetti, confettiCount, createConfetti, type Piece, stepConfetti } from './confetti'

const MAX_DPR = 2
const MAX_STEP_MS = 50
/** With reduced motion a lighter, still sprinkle is drawn once. */
const STILL_SHARE = 0.4

function readPalette(): string[] {
  const styles = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  return [
    read('--season-magenta', '#ff5fa2'),
    read('--season-yellow', '#ffd23f'),
    read('--season-cyan', '#22d3ee'),
    read('--season-green', '#4ade80'),
  ]
}

/**
 * Confetti over the whole site. It never takes a click (pointer-events-none): the pointer
 * blows pieces away, and a click on empty page space throws a handful from there.
 */
export function ConfettiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const still = prefersReducedMotion()
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let width = 0
    let height = 0
    let pieces: Piece[] = []
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
      if (!pieces.length || rect.width !== width) {
        const count = confettiCount(rect.width, rect.height, coarse)
        pieces = createConfetti(
          still ? Math.round(count * STILL_SHARE) : count,
          rect.width,
          rect.height,
          Math.random,
        )
      } else if (height) {
        // Phones resize when the URL bar slides mid-scroll: keep the confetti where it is.
        const ratio = rect.height / height
        for (const p of pieces) p.y *= ratio
      }
      width = rect.width
      height = rect.height
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of pieces) {
        ctx.globalAlpha = p.burst ? 0.95 : 0.8
        ctx.fillStyle = palette[p.color % palette.length]
        if (p.shape === 'dot') {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // A paper strip turning over as it falls.
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.angle)
          ctx.scale(1, Math.cos(p.phase))
          ctx.fillRect(-p.size / 2, -p.size / 5, p.size, (p.size * 2) / 5)
          ctx.restore()
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      frame = 0
      if (document.hidden) return
      const dt = last ? Math.min(now - last, MAX_STEP_MS) : 16
      last = now
      pieces = stepConfetti(pieces, dt, width, height, pointer, Math.random)
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
    const onLeave = () => {
      pointer = null
    }
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) pointer = null
    }
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || still) return
      const selection = window.getSelection()?.toString() ?? ''
      if (!isEmptySpot(event.target as Element | null, selection)) return
      pieces = burstConfetti(pieces, event.clientX, event.clientY, Math.random)
      playWhistle()
    }
    // Only a real theme change re-reads the colours: smooth scroll toggles classes on
    // <html> at every scroll start and stop.
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
    document.addEventListener('click', onClick)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      theme.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onLeave)
      document.removeEventListener('click', onClick)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas with no tabindex.
    <canvas
      ref={ref}
      aria-hidden="true"
      data-confetti
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  )
}
