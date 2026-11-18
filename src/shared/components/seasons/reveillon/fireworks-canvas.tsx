'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import {
  ambientTarget,
  burst,
  createFireworks,
  type Fireworks,
  isEmptySpot,
  isIdle,
  launch,
  rocketAt,
  stepFireworks,
} from './fireworks'
import { fireworksBus } from './fireworks-bus'
import { playPop } from './reveillon-sound'

const MAX_DPR = 2
const MAX_STEP_MS = 50
/** Automatic fireworks: one every few seconds, fewer on phones. */
const AMBIENT_MS: [number, number] = [4500, 8000]
const AMBIENT_PHONE_MS: [number, number] = [7000, 11000]
const FINALE_EVERY_MS = 170
/** With reduced motion a clicked burst is drawn once, already open, then cleared. */
const STILL_BURST_MS = 700
const STILL_SPREAD_STEPS = 18

function readPalette(): string[] {
  const styles = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  return [
    read('--season-gold', '#f2c14e'),
    read('--season-champagne', '#f7e7c4'),
    read('--season-silver', '#d9e2ec'),
  ]
}

/**
 * Fireworks over the whole site. The canvas never takes a click: clicks on empty page
 * space are heard on the document and launch a rocket there. The loop runs only while
 * something is in the sky.
 */
export function FireworksCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const still = prefersReducedMotion()
    const phone = window.matchMedia('(pointer: coarse)').matches
    const sky: Fireworks = createFireworks()
    let width = 0
    let height = 0
    let frame = 0
    let last = 0
    let ambient = 0
    let finaleTimer = 0
    let finaleUntil = 0
    let clearStill = 0
    let palette = readPalette()
    let colorTurn = 0
    /** Rockets the visitor launched pop when they burst (with the season sound on). */
    const clicked = new WeakSet<object>()

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
      ctx.lineCap = 'round'
      for (const rocket of sky.rockets) {
        const { x, y } = rocketAt(rocket)
        ctx.globalAlpha = 0.9
        ctx.strokeStyle = palette[rocket.color % palette.length]
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x, y + 14)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
      for (const spark of sky.sparks) {
        ctx.globalAlpha = Math.max(0, spark.life / spark.max)
        ctx.strokeStyle = palette[spark.color % palette.length]
        ctx.lineWidth = 1.8
        ctx.beginPath()
        ctx.moveTo(spark.x - spark.vx * 40, spark.y - spark.vy * 40)
        ctx.lineTo(spark.x, spark.y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      frame = 0
      if (document.hidden) return
      const dt = last ? Math.min(now - last, MAX_STEP_MS) : 16
      last = now
      for (const rocket of stepFireworks(sky, dt, Math.random)) {
        if (clicked.has(rocket)) playPop()
      }
      draw()
      if (!isIdle(sky)) frame = requestAnimationFrame(loop)
    }
    const wake = () => {
      if (frame || document.hidden) return
      last = 0
      frame = requestAnimationFrame(loop)
    }

    const fire = (
      to: { x: number; y: number },
      from?: { x: number; y: number },
      byHand = false,
    ) => {
      colorTurn = (colorTurn + 1) % palette.length
      if (still) {
        // No flight and no fall: the burst appears open, then goes.
        burst(sky, to.x, to.y, colorTurn, 48, Math.random)
        for (let i = 0; i < STILL_SPREAD_STEPS; i++) {
          for (const spark of sky.sparks) {
            spark.x += spark.vx * 16
            spark.y += spark.vy * 16
          }
        }
        draw()
        window.clearTimeout(clearStill)
        clearStill = window.setTimeout(() => {
          sky.sparks = []
          draw()
        }, STILL_BURST_MS)
        if (byHand) playPop()
        return
      }
      const start = from ?? { x: to.x + (Math.random() - 0.5) * 80, y: height + 10 }
      if (launch(sky, start, to, colorTurn) && byHand)
        clicked.add(sky.rockets[sky.rockets.length - 1])
      wake()
    }

    const scheduleAmbient = () => {
      window.clearTimeout(ambient)
      if (still || document.hidden) return
      const [min, max] = phone ? AMBIENT_PHONE_MS : AMBIENT_MS
      ambient = window.setTimeout(
        () => {
          fire(ambientTarget(width, height, Math.random))
          scheduleAmbient()
        },
        min + Math.random() * (max - min),
      )
    }

    const finale = (ms: number) => {
      finaleUntil = performance.now() + ms
      window.clearInterval(finaleTimer)
      finaleTimer = window.setInterval(() => {
        if (performance.now() > finaleUntil) {
          window.clearInterval(finaleTimer)
          return
        }
        fire({ x: width * (0.08 + Math.random() * 0.84), y: height * (0.08 + Math.random() * 0.5) })
      }, FINALE_EVERY_MS)
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      const selection = window.getSelection()?.toString() ?? ''
      if (!isEmptySpot(event.target as Element | null, selection)) return
      fire({ x: event.clientX, y: event.clientY }, undefined, true)
    }
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
        window.clearTimeout(ambient)
      } else {
        wake()
        scheduleAmbient()
      }
    }
    const onResize = () => resize()
    // Light and dark draw in different golds. Smooth scroll toggles classes on <html> at
    // every scroll start and stop, so only a real theme change re-reads the palette.
    const themeOf = (classes: string | null) => /\b(light|dark)\b/.exec(classes ?? '')?.[1]
    const theme = new MutationObserver((records) => {
      const changed = records.some(
        (record) =>
          record.attributeName !== 'class' ||
          themeOf(record.oldValue) !== themeOf(document.documentElement.className),
      )
      if (changed) palette = readPalette()
    })

    const unsubscribe = fireworksBus.subscribe((command) => {
      if (command.type === 'finale') finale(command.ms)
      else fire({ x: command.x, y: command.y }, command.from, true)
    })

    resize()
    scheduleAmbient()
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-color-theme'],
      attributeOldValue: true,
    })
    document.addEventListener('click', onClick)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(ambient)
      window.clearTimeout(clearStill)
      window.clearInterval(finaleTimer)
      unsubscribe()
      theme.disconnect()
      document.removeEventListener('click', onClick)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas with no tabindex.
    <canvas
      ref={ref}
      aria-hidden="true"
      data-fireworks
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  )
}
