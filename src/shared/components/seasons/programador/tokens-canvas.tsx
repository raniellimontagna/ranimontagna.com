'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { isEmptySpot } from '../shared/empty-spot'
import { playKey } from './programador-sound'
import {
  burstTokens,
  createTokens,
  stepTokens,
  type Token,
  tokenOpacity,
  tokensCount,
} from './tokens'
import { tokensBus } from './tokens-bus'

const MAX_DPR = 2
const MAX_STEP_MS = 50
const AMBIENT_ALPHA = 0.35
const BURST_ALPHA = 0.85

function readStyle(): { palette: string[]; font: string } {
  const styles = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  return {
    palette: [
      read('--season-keyword', '#c4b5fd'),
      read('--season-string', '#4ade80'),
      read('--season-number', '#fbbf24'),
      read('--season-function', '#22d3ee'),
    ],
    font: `${read('--font-mono', 'ui-monospace')}, monospace`,
  }
}

/**
 * Code tokens drifting up the whole site, faint, sliding away from the pointer. They never
 * take a click (pointer-events-none); a click on empty page space, or on the name, throws a
 * handful from there. With reduced motion they stand still and nothing is thrown.
 */
export function TokensCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const still = prefersReducedMotion()
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let width = 0
    let height = 0
    let tokens: Token[] = []
    let frame = 0
    let last = 0
    let style = readStyle()
    let pointer: { x: number; y: number } | null = null

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!tokens.length || rect.width !== width) {
        const count = tokensCount(rect.width, rect.height, coarse)
        tokens = createTokens(
          still ? Math.round(count / 2) : count,
          rect.width,
          rect.height,
          Math.random,
        )
      } else if (height) {
        // Same width (a phone's toolbar): keep each token where it was, in proportion.
        const ratio = rect.height / height
        for (const t of tokens) t.y *= ratio
      }
      width = rect.width
      height = rect.height
    }
    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.textBaseline = 'middle'
      for (const t of tokens) {
        ctx.globalAlpha = tokenOpacity(t, height) * (t.burst ? BURST_ALPHA : AMBIENT_ALPHA)
        ctx.fillStyle = style.palette[t.color % style.palette.length]
        ctx.font = `600 ${t.size}px ${style.font}`
        ctx.fillText(t.text, t.x, t.y)
      }
      ctx.globalAlpha = 1
    }
    const loop = (now: number) => {
      frame = 0
      if (document.hidden) return
      const dt = last ? Math.min(now - last, MAX_STEP_MS) : 16
      last = now
      tokens = stepTokens(tokens, dt, width, height, pointer, Math.random)
      draw()
      frame = requestAnimationFrame(loop)
    }
    const start = () => {
      if (still || frame || document.hidden) return
      last = 0
      frame = requestAnimationFrame(loop)
    }
    const throwFrom = (x: number, y: number) => {
      if (still) return
      tokens = burstTokens(tokens, x, y, Math.random)
      start()
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
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || still) return
      const selection = window.getSelection()?.toString() ?? ''
      if (!isEmptySpot(event.target as Element | null, selection)) return
      throwFrom(event.clientX, event.clientY)
      playKey()
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
      style = readStyle()
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
    const unsubscribe = tokensBus.subscribe(({ x, y }) => throwFrom(x, y))
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerout', onPointerOut)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(frame)
      theme.disconnect()
      unsubscribe()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas with no tabindex.
    <canvas
      ref={ref}
      aria-hidden="true"
      data-code-tokens
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  )
}
