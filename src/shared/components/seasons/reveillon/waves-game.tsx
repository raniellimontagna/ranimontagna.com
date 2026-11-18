'use client'

import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '@/shared/components/motion'
import { track } from '@/shared/lib/analytics/track'
import { fill } from '../shared/fill'
import { SoundIcon } from '../shared/sound-icon'
import { SoundToggle } from '../shared/sound-toggle'
import { useSlots } from '../shared/use-slots'
import { getReveillonCopy } from './reveillon-copy'
import { SparkIcon } from './reveillon-icons'
import { playSplash } from './reveillon-sound'
import {
  createWaves,
  jump,
  jumpHeight,
  loadCleared,
  PLAYER_X,
  saveCleared,
  stepWaves,
  type WavesState,
  WISH_COUNT,
} from './waves'

const MAX_DPR = 2
const MAX_STEP_MS = 50

type WavesGameProps = {
  locale: string
  edition: number
  /** The seventh wave was just jumped. */
  onComplete: () => void
  /** The visitor asks for the card again. */
  onReopen: () => void
}

type SeaPalette = { gold: string; silver: string; ink: string }

function readPalette(): SeaPalette {
  const styles = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  return {
    gold: read('--season-gold', '#f2c14e'),
    silver: read('--season-silver', '#d9e2ec'),
    ink: read('--foreground', '#edf4ef'),
  }
}

/** A token colour with alpha, for canvas (which may not parse color-mix everywhere). */
export function withAlpha(color: string, alpha: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color
  return `${color}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`
}

function drawSea(
  ctx: CanvasRenderingContext2D,
  state: WavesState,
  w: number,
  h: number,
  { gold, silver, ink }: SeaPalette,
) {
  const sea = h * 0.7
  ctx.clearRect(0, 0, w, h)

  // The water line, breathing a little.
  ctx.globalAlpha = 0.35
  ctx.strokeStyle = silver
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let x = 0; x <= w; x += 8) {
    const y = sea + Math.sin(x / 38 + state.t / 600) * 2
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // The sea under the water line, fading into the page.
  const body = ctx.createLinearGradient(0, sea, 0, h)
  body.addColorStop(0, withAlpha(silver, 0.18))
  body.addColorStop(1, withAlpha(silver, 0))
  ctx.globalAlpha = 1
  ctx.fillStyle = body
  ctx.fillRect(0, sea, w, h - sea)

  // Each wave: a long swell whose crest curls forward (left, where it is going), foam on top.
  for (const wave of state.waves) {
    const cx = wave.x * w
    const back = Math.max(60, w * 0.11)
    const front = Math.max(26, w * 0.045)
    const crest = sea - h * 0.32
    const swell = ctx.createLinearGradient(0, crest, 0, sea)
    swell.addColorStop(0, silver)
    swell.addColorStop(1, withAlpha(silver, 0.25))
    ctx.globalAlpha = wave.done ? 0.45 : 0.9
    ctx.fillStyle = swell
    ctx.beginPath()
    ctx.moveTo(cx + back, sea)
    ctx.bezierCurveTo(cx + back * 0.45, sea, cx + front * 0.6, crest, cx - front * 0.15, crest)
    ctx.quadraticCurveTo(cx - front * 0.9, crest + h * 0.01, cx - front * 0.7, crest + h * 0.1)
    ctx.quadraticCurveTo(cx - front * 0.35, crest + h * 0.06, cx - front * 0.2, crest + h * 0.14)
    ctx.quadraticCurveTo(cx - front * 0.5, sea - h * 0.05, cx - front * 1.3, sea)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = wave.done ? 0.5 : 1
    ctx.strokeStyle = gold
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx + front * 0.9, crest + h * 0.07)
    ctx.quadraticCurveTo(cx + front * 0.2, crest - 1, cx - front * 0.15, crest)
    ctx.quadraticCurveTo(cx - front * 0.9, crest + h * 0.01, cx - front * 0.7, crest + h * 0.1)
    ctx.stroke()
  }

  // The jumper, dressed in white for the new year.
  const px = PLAYER_X * w
  const lift = jumpHeight(state) * h * 0.42
  const feet = sea - lift
  ctx.globalAlpha = 1
  ctx.fillStyle = '#fbf8f1'
  ctx.strokeStyle = ink
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(px - 7, feet - 30, 14, 24, 6)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(px, feet - 38, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(px - 4, feet - 6)
  ctx.lineTo(px - 5, feet)
  ctx.moveTo(px + 4, feet - 6)
  ctx.lineTo(px + 5, feet)
  if (lift > 0) {
    // Arms up while over the wave.
    ctx.moveTo(px - 6, feet - 26)
    ctx.lineTo(px - 12, feet - 40)
    ctx.moveTo(px + 6, feet - 26)
    ctx.lineTo(px + 12, feet - 40)
  }
  ctx.stroke()
}

/**
 * The New Year's game at the end of the home page: jump seven waves, one wish each.
 * The "Jump" button (or Space, Enter, ArrowUp) jumps; tapping the sea too. The sea moves
 * only after the first jump, while it is on screen; with reduced motion every jump
 * clears a wave.
 */
export function WavesGame({ locale, edition, onComplete, onReopen }: WavesGameProps) {
  const copy = getReveillonCopy(locale)
  const [slot] = useSlots('[data-season-slot="play"]')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [initial] = useState(() => createWaves(loadCleared(edition)))
  const stateRef = useRef<WavesState>(initial)
  const paletteRef = useRef<SeaPalette | null>(null)
  const [cleared, setCleared] = useState(() => stateRef.current.cleared)
  const [message, setMessage] = useState('')
  const startRef = useRef<() => void>(() => {})
  const still = useRef(prefersReducedMotion())

  const score = useCallback(
    (outcome: 'cleared' | 'missed') => {
      const count = stateRef.current.cleared
      if (outcome === 'missed') {
        setMessage(copy.missed)
        return
      }
      setCleared(count)
      saveCleared(edition, count)
      playSplash()
      setMessage(fill(copy.jumped, { n: count, wish: copy.wishes[count - 1] }))
      track('season-wave', { season: 'reveillon', found: count })
      if (count === WISH_COUNT) {
        track('season-hunt-complete', { season: 'reveillon' })
        onComplete()
      }
    },
    [copy, edition, onComplete],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!slot || !canvas || !ctx) return

    const state = stateRef.current
    let width = 0
    let height = 0
    let frame = 0
    let last = 0
    let started = false
    let onScreen = true
    // Read once, and again only on a real theme change (smooth scroll toggles classes).
    paletteRef.current = readPalette()
    const themeOf = (classes: string | null) => /\b(light|dark)\b/.exec(classes ?? '')?.[1]
    const theme = new MutationObserver((records) => {
      const changed = records.some(
        (record) =>
          record.attributeName !== 'class' ||
          themeOf(record.oldValue) !== themeOf(document.documentElement.className),
      )
      if (!changed) return
      paletteRef.current = readPalette()
      drawSea(ctx, state, width, height, paletteRef.current)
    })

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawSea(ctx, state, width, height, paletteRef.current ?? readPalette())
    }
    const loop = (now: number) => {
      frame = 0
      const dt = last ? Math.min(now - last, MAX_STEP_MS) : 16
      last = now
      const outcome = stepWaves(state, dt, started)
      if (outcome) score(outcome)
      drawSea(ctx, state, width, height, paletteRef.current ?? readPalette())
      if (state.cleared < WISH_COUNT && onScreen && !document.hidden) {
        frame = requestAnimationFrame(loop)
      }
    }
    // The sea rolls while on screen; it counts only once the visitor has jumped.
    const run = () => {
      if (still.current || frame || !onScreen || document.hidden || state.cleared >= WISH_COUNT) {
        return
      }
      last = 0
      frame = requestAnimationFrame(loop)
    }
    startRef.current = () => {
      started = true
      run()
    }

    const visibility =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            onScreen = entry?.isIntersecting ?? true
            if (onScreen) run()
            else {
              cancelAnimationFrame(frame)
              frame = 0
            }
          })
        : null
    const onVisibility = () => run()
    const sized = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null

    resize()
    run()
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-color-theme'],
      attributeOldValue: true,
    })
    visibility?.observe(canvas)
    sized?.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(frame)
      theme.disconnect()
      visibility?.disconnect()
      sized?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      startRef.current = () => {}
    }
  }, [slot, score])

  const onJump = () => {
    const state = stateRef.current
    if (still.current) {
      // No moving sea: each jump clears the next wave.
      if (state.cleared >= WISH_COUNT) return
      state.cleared += 1
      score('cleared')
      const ctx = canvasRef.current?.getContext('2d')
      const rect = canvasRef.current?.getBoundingClientRect()
      if (ctx && rect) {
        drawSea(ctx, state, rect.width, rect.height, paletteRef.current ?? readPalette())
      }
      return
    }
    if (jump(state)) startRef.current()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowUp') return
    event.preventDefault()
    // A held key repeats: one press, one jump.
    if (!event.repeat) onJump()
  }

  if (!slot) return null
  const done = cleared >= WISH_COUNT

  return createPortal(
    <section
      aria-labelledby="reveillon-waves-title"
      className="reveillon-sea"
      data-no-fireworks
      data-waves-game
      onKeyDown={onKeyDown}
    >
      <div className="reveillon-sea-head">
        <h2 id="reveillon-waves-title" className="reveillon-sea-title">
          {copy.wavesTitle}
        </h2>
        <p className="reveillon-sea-intro">{copy.wavesIntro}</p>
      </div>
      {/* A tap on the sea is a shortcut; the Jump button below is the keyboard path. A click,
          not a pointerdown: a scroll gesture starting on the sea is not a jump. */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: shortcut for the Jump button below. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: the Jump button below is the keyboard path. */}
      <div className="reveillon-sea-stage" onClick={done ? undefined : onJump}>
        {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas with no tabindex. */}
        <canvas ref={canvasRef} aria-hidden="true" className="reveillon-sea-canvas" />
      </div>
      <div className="reveillon-sea-controls">
        {done ? (
          <button type="button" onClick={onReopen} className="reveillon-sea-jump">
            {copy.openCard}
          </button>
        ) : (
          <button type="button" onClick={onJump} className="reveillon-sea-jump">
            {copy.jump}
          </button>
        )}
        <span className="reveillon-sea-progress">{fill(copy.progress, { n: cleared })}</span>
        <ol className="reveillon-sea-wishes" aria-label={copy.wishesLabel}>
          {copy.wishes.map((wish, index) => {
            const lit = index < cleared
            // Screen readers hear only the wishes already made; the rest are decoration.
            return (
              <li key={wish} data-lit={lit || undefined} aria-hidden={lit ? undefined : true}>
                <SparkIcon />
                <span className={lit ? undefined : 'sr-only'}>{wish}</span>
              </li>
            )
          })}
        </ol>
        <SoundToggle
          label={copy.sound}
          className="reveillon-sea-sound"
          icon={(on) => <SoundIcon on={on} />}
        />
      </div>
      <p role="status" className="sr-only">
        {done ? copy.done : message}
      </p>
    </section>,
    slot,
  )
}
