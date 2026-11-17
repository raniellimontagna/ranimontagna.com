'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NATAL_PORTRAIT_IMAGE } from '@/features/home/components/portrait/portrait-image'
import { prefersReducedMotion } from '@/shared/components/motion'
import { makeFlakeSprite } from './flake-sprite'
import { shakeEnergy, stepGlobeFlakes, throwFlakes } from './globe-physics'
import { getNatalCopy } from './natal-copy'
import { createFlakes } from './snowfall'

const GLOBE_FLAKES = 70
const SETTLE_STEPS = 400
const MAX_DPR = 2
const MAX_STEP_MS = 50
/** After the shaking fades, the snow keeps falling this long before the loop stops. */
const SETTLE_MS = 4000
const SHAKE_THRESHOLD = 12
/** The smallest portrait copy is plenty for a globe a few hundred pixels wide. */
const PORTRAIT_SMALL = NATAL_PORTRAIT_IMAGE.srcSet.split(', ')[0].split(' ')[0]

type DeviceMotionWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

type SnowGlobeProps = {
  open: boolean
  onClose: () => void
  locale: string
}

function token(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

/** The hunt's reward: a snow globe with the portrait inside, and a holiday card. */
export function SnowGlobe({ open, onClose, locale }: SnowGlobeProps) {
  const copy = getNatalCopy(locale)
  const dialogRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shakeRef = useRef<(impulse: number) => void>(() => {})
  const motionRef = useRef<((event: DeviceMotionEvent) => void) | null>(null)
  const [copied, setCopied] = useState(false)
  const [canShakePhone] = useState(
    () => typeof window !== 'undefined' && 'DeviceMotionEvent' in window,
  )

  // Focus moves in, Tab stays in, Escape closes, focus goes back where it was.
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = dialogRef.current
    dialog?.querySelector<HTMLElement>('button')?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const items = Array.from(dialog.querySelectorAll<HTMLElement>('button'))
      const first = items[0]
      const last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const still = prefersReducedMotion()
    const rect = canvas.getBoundingClientRect()
    const width = rect.width || 320
    const height = rect.height || 380
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const radius = Math.min(width, height * 0.82) / 2 - 6
    const cx = width / 2
    const cy = radius + 6
    const red = token('--season-red', '#b3261e')
    const gold = token('--season-gold', '#a8781a')
    const sprite = makeFlakeSprite('#ffffff')
    const scatter = () =>
      createFlakes(GLOBE_FLAKES, radius * 2, radius * 2).map((f) => ({
        ...f,
        x: f.x - radius,
        y: f.y - radius,
      }))
    let flakes = scatter()
    for (let i = 0; i < SETTLE_STEPS; i++) stepGlobeFlakes(flakes, 0, 16, radius)

    const portrait = new Image()
    portrait.src = PORTRAIT_SMALL

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Base under the glass: a red pedestal with a gold band, shaded so it reads as solid
      const baseTop = cy + radius * 0.84
      const baseBottom = height - 4
      ctx.fillStyle = red
      ctx.beginPath()
      ctx.moveTo(cx - radius * 0.72, baseTop)
      ctx.lineTo(cx + radius * 0.72, baseTop)
      ctx.lineTo(cx + radius * 0.9, baseBottom)
      ctx.lineTo(cx - radius * 0.9, baseBottom)
      ctx.closePath()
      ctx.fill()
      const shade = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0)
      shade.addColorStop(0, 'rgb(0 0 0 / 30%)')
      shade.addColorStop(0.35, 'rgb(255 255 255 / 12%)')
      shade.addColorStop(1, 'rgb(0 0 0 / 40%)')
      ctx.fillStyle = shade
      ctx.fill()
      ctx.fillStyle = gold
      ctx.fillRect(cx - radius * 0.81, baseTop + (baseBottom - baseTop) * 0.5, radius * 1.62, 4)

      // Inside the glass: the portrait and the snow
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = '#0b1215'
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
      if (portrait.complete && portrait.naturalWidth) {
        const scale = (radius * 2.1) / portrait.naturalWidth
        const w = portrait.naturalWidth * scale
        const h = portrait.naturalHeight * scale
        ctx.drawImage(portrait, cx - w / 2, cy - radius * 1.05, w, h)
      }
      for (const f of flakes) {
        const size = f.r * 4.4
        ctx.globalAlpha = f.alpha
        ctx.drawImage(sprite, cx + f.x - size / 2, cy + f.y - size / 2, size, size)
      }
      ctx.globalAlpha = 1
      ctx.restore()

      // The glass: rim and a soft highlight
      ctx.strokeStyle = 'rgb(255 255 255 / 45%)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = 'rgb(255 255 255 / 30%)'
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.86, Math.PI * 1.08, Math.PI * 1.38)
      ctx.stroke()
    }

    let energy = 0
    let frame = 0
    let last = 0
    let quietSince = 0
    const loop = (now: number) => {
      frame = 0
      const dt = last ? Math.min(now - last, MAX_STEP_MS) : 16
      last = now
      energy = shakeEnergy(energy, 0, dt)
      stepGlobeFlakes(flakes, energy, dt, radius)
      draw()
      if (energy > 0.01) quietSince = now
      if (now - quietSince < SETTLE_MS) frame = requestAnimationFrame(loop)
    }
    const shake = (impulse: number) => {
      if (still) {
        // No motion: the snow simply lands somewhere else.
        flakes = scatter()
        for (let i = 0; i < SETTLE_STEPS; i++) stepGlobeFlakes(flakes, 0, 16, radius)
        draw()
        return
      }
      // A real shake throws the snow through the glass; a drag only stirs it.
      if (impulse >= 0.5) throwFlakes(flakes, radius)
      energy = shakeEnergy(energy, impulse, 0)
      quietSince = performance.now()
      if (!frame) {
        last = 0
        frame = requestAnimationFrame(loop)
      }
    }
    shakeRef.current = shake

    let drag: { x: number; y: number; t: number } | null = null
    const onPointerDown = (event: PointerEvent) => {
      drag = { x: event.clientX, y: event.clientY, t: performance.now() }
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!drag) return
      const now = performance.now()
      const distance = Math.hypot(event.clientX - drag.x, event.clientY - drag.y)
      const speed = (distance / Math.max(1, now - drag.t)) * 1000
      drag = { x: event.clientX, y: event.clientY, t: now }
      shake(Math.min(0.35, speed / 4000))
    }
    const onPointerUp = () => {
      drag = null
    }

    portrait.addEventListener('load', draw)
    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    draw()

    return () => {
      cancelAnimationFrame(frame)
      portrait.removeEventListener('load', draw)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      if (motionRef.current) window.removeEventListener('devicemotion', motionRef.current)
      motionRef.current = null
      shakeRef.current = () => {}
    }
  }, [open])

  const shakePhone = async () => {
    const Motion = window.DeviceMotionEvent as DeviceMotionWithPermission
    try {
      if (typeof Motion.requestPermission === 'function') {
        if ((await Motion.requestPermission()) !== 'granted') return
      }
    } catch {
      return
    }
    if (motionRef.current) return
    const onMotion = (event: DeviceMotionEvent) => {
      const a = event.acceleration
      const magnitude = Math.hypot(a?.x ?? 0, a?.y ?? 0, a?.z ?? 0)
      if (magnitude > SHAKE_THRESHOLD) shakeRef.current(Math.min(1, magnitude / 30))
    }
    motionRef.current = onMotion
    window.addEventListener('devicemotion', onMotion)
    shakeRef.current(0.6)
  }

  const share = async () => {
    const url = `${window.location.origin}${locale === 'pt' ? '/' : `/${locale}`}`
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: copy.cardTitle, text: copy.shareText, url })
      } catch {
        // Cancelled by the visitor.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // No clipboard either: nothing to do.
    }
  }

  if (!open) return null

  return createPortal(
    <div className="natal-globe-backdrop">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="natal-globe-title"
        className="natal-globe"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={copy.globeLabel}
          className="natal-globe-canvas"
        />
        <h2 id="natal-globe-title" className="natal-globe-title">
          {copy.cardTitle}
        </h2>
        <p className="natal-globe-body">{copy.cardBody}</p>
        <div className="natal-globe-actions">
          <button type="button" onClick={() => shakeRef.current(1)} className="natal-globe-primary">
            {copy.shake}
          </button>
          {canShakePhone ? (
            <button type="button" onClick={shakePhone} className="natal-globe-button">
              {copy.shakePhone}
            </button>
          ) : null}
          <button type="button" onClick={share} className="natal-globe-button">
            {copy.share}
          </button>
          <button type="button" onClick={onClose} className="natal-globe-button">
            {copy.close}
          </button>
        </div>
        <p role="status" className="natal-globe-status">
          {copied ? copy.linkCopied : ''}
        </p>
      </div>
    </div>,
    document.body,
  )
}
