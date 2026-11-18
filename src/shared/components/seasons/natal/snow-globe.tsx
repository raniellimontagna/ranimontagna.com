'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NATAL_PORTRAIT_IMAGE } from '@/features/home/components/portrait/portrait-image'
import {
  prefersReducedMotion,
  startSmoothScroll,
  stopSmoothScroll,
} from '@/shared/components/motion'
import { makeFlakeSprite } from './flake-sprite'
import { shakeEnergy, stepGlobeFlakes, throwFlakes } from './globe-physics'
import { fill, getNatalCopy } from './natal-copy'
import { isSeasonSoundOn, playJingle } from './season-sound'
import { createFlakes } from './snowfall'
import { SoundToggle } from './sound-toggle'

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

/**
 * The hunt's reward: a snow globe with the portrait inside, and a holiday card.
 * A native modal <dialog>: the browser makes the page inert, keeps focus inside,
 * closes on Esc or the back gesture and gives focus back to where it was.
 */
export function SnowGlobe({ open, onClose, locale }: SnowGlobeProps) {
  const copy = getNatalCopy(locale)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shakeRef = useRef<(impulse: number) => void>(() => {})
  const motionRef = useRef<((event: DeviceMotionEvent) => void) | null>(null)
  const stopJingleRef = useRef<() => void>(() => {})
  const [copied, setCopied] = useState(false)
  // Desktop browsers expose DeviceMotionEvent too, but only a phone can be shaken.
  const [canShakePhone] = useState(
    () =>
      typeof window !== 'undefined' &&
      'DeviceMotionEvent' in window &&
      window.matchMedia('(pointer: coarse)').matches,
  )

  // Before paint and before the node leaves: closing first lets the browser return focus.
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return
    openRef.current = true
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal()
    // Lenis scrolls the page from wheel events, which an inert page still receives.
    stopSmoothScroll()
    return () => {
      openRef.current = false
      if (typeof dialog.close === 'function' && dialog.open) dialog.close()
      startSmoothScroll()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const still = prefersReducedMotion()
    let width = 0
    let height = 0
    let radius = 0
    let cx = 0
    let cy = 0
    const measure = () => {
      const rect = canvas.getBoundingClientRect()
      const previous = radius
      width = rect.width || 320
      height = rect.height || 380
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      radius = Math.min(width, height * 0.82) / 2 - 6
      cx = width / 2
      cy = radius + 6
      return previous ? radius / previous : 1
    }
    measure()
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

    // The pointer is captured, so a drag released outside the window still ends.
    let drag: { x: number; y: number; t: number } | null = null
    const onPointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture?.(event.pointerId)
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
    // A phone that rotates, or a window resized, redraws the globe at its new size.
    const onResize = () => {
      const scale = measure()
      for (const f of flakes) {
        f.x *= scale
        f.y *= scale
      }
      draw()
    }

    portrait.addEventListener('load', draw)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('lostpointercapture', onPointerUp)
    window.addEventListener('resize', onResize)
    draw()

    return () => {
      cancelAnimationFrame(frame)
      portrait.removeEventListener('load', draw)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('lostpointercapture', onPointerUp)
      window.removeEventListener('resize', onResize)
      if (motionRef.current) window.removeEventListener('devicemotion', motionRef.current)
      motionRef.current = null
      stopJingleRef.current()
      stopJingleRef.current = () => {}
      shakeRef.current = () => {}
    }
  }, [open])

  /** A hard shake rings the jingle, when the Christmas sound is on. */
  const ring = () => {
    if (!isSeasonSoundOn()) return
    stopJingleRef.current()
    stopJingleRef.current = playJingle()
  }

  const shakeHard = () => {
    shakeRef.current(1)
    ring()
  }

  const shakePhone = async () => {
    const Motion = window.DeviceMotionEvent as DeviceMotionWithPermission
    try {
      if (typeof Motion.requestPermission === 'function') {
        if ((await Motion.requestPermission()) !== 'granted') return
      }
    } catch {
      return
    }
    // The permission prompt can outlive the globe: never listen after it closed.
    if (motionRef.current || !openRef.current) return
    const onMotion = (event: DeviceMotionEvent) => {
      const a = event.acceleration
      const magnitude = Math.hypot(a?.x ?? 0, a?.y ?? 0, a?.z ?? 0)
      if (magnitude > SHAKE_THRESHOLD) shakeRef.current(Math.min(1, magnitude / 30))
    }
    motionRef.current = onMotion
    window.addEventListener('devicemotion', onMotion)
    shakeRef.current(0.6)
    ring()
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

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="natal-globe-title"
      className="natal-globe"
      onCancel={(event) => {
        // Esc or the back gesture: the parent owns the open state.
        event.preventDefault()
        onClose()
      }}
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
      <p className="natal-globe-body">
        {fill(copy.cardBody, { next: new Date().getFullYear() + 1 })}
      </p>
      <div className="natal-globe-actions">
        {/* First focusable control: showModal() focuses it, the dialog's primary action. */}
        <button type="button" onClick={shakeHard} className="natal-globe-primary">
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
        <SoundToggle label={copy.sound} className="natal-globe-button natal-globe-sound" />
        <button type="button" onClick={onClose} className="natal-globe-button">
          {copy.close}
        </button>
      </div>
      <p role="status" className="natal-globe-status">
        {copied ? copy.linkCopied : ''}
      </p>
    </dialog>
  )
}
