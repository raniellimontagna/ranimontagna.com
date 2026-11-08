'use client'

import { useEffect, useMemo, useRef } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { createParticles, type Particle, project, stepParticles } from './vega-particles'

const SEED = 20261107
const FRAME = 170

type VegaMarkProps = {
  size: number
  density?: number
  thinking?: boolean
  label?: string
  className?: string
}

function readColors() {
  const styles = getComputedStyle(document.documentElement)
  return {
    accent: styles.getPropertyValue('--accent').trim() || 'currentColor',
    ink: styles.getPropertyValue('--foreground').trim() || 'currentColor',
  }
}

function draw(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  t: number,
  size: number,
  dpr: number,
  colors: { accent: string; ink: string },
) {
  const scale = size / FRAME
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, size, size)
  ctx.setTransform(dpr, 0, 0, dpr, (size / 2) * dpr, (size / 2) * dpr)
  let star: Particle | undefined
  ctx.fillStyle = colors.ink
  ctx.shadowBlur = 0
  for (const p of particles) {
    if (p.star) {
      star = p
      continue
    }
    const { sx, sy, depth } = project(p, t, scale)
    ctx.globalAlpha = p.alpha * Math.min(1, depth)
    ctx.beginPath()
    ctx.arc(sx, sy, Math.max(0.4, p.size * depth * scale), 0, Math.PI * 2)
    ctx.fill()
  }
  if (star) {
    const { sx, sy, depth } = project(star, t, scale)
    ctx.globalAlpha = 1
    ctx.fillStyle = colors.accent
    ctx.shadowColor = colors.accent
    ctx.shadowBlur = 12 * scale
    ctx.beginPath()
    ctx.arc(sx, sy, star.size * depth * Math.max(scale, 0.6), 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }
}

/**
 * Vega's mark: star dust drawing the Summer Triangle, Vega lit in the accent
 * color. While thinking the dust swirls and then settles back. It only runs
 * while visible; without motion it is drawn once, still.
 */
export function VegaMark({
  size,
  density = 260,
  thinking = false,
  label,
  className,
}: VegaMarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const thinkingRef = useRef(thinking)
  const particles = useMemo(() => createParticles(density, SEED), [density])

  useEffect(() => {
    thinkingRef.current = thinking
  }, [thinking])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    let colors = readColors()

    if (prefersReducedMotion()) {
      draw(ctx, particles, 0, size, dpr, colors)
      return
    }

    let frame = 0
    let visible = false
    let running = false
    const start = performance.now()

    const tick = (now: number) => {
      stepParticles(particles, thinkingRef.current ? 'think' : 'rest')
      draw(ctx, particles, (now - start) / 1000, size, dpr, colors)
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      const shouldRun = visible && !document.hidden
      if (shouldRun === running) return
      running = shouldRun
      if (running) frame = requestAnimationFrame(tick)
      else cancelAnimationFrame(frame)
    }

    draw(ctx, particles, 0, size, dpr, colors)
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      sync()
    })
    observer.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    const themeObserver = new MutationObserver(() => {
      colors = readColors()
    })
    themeObserver.observe(document.documentElement, { attributes: true })

    return () => {
      observer.disconnect()
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', sync)
      cancelAnimationFrame(frame)
    }
  }, [particles, size])

  return (
    <canvas
      ref={canvasRef}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
