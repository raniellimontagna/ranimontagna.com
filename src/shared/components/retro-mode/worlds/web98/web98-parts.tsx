'use client'

import { type FormEvent, useCallback, useEffect, useId, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { NOTE, playTones, type Tone } from '../world-sound'
import type { GuestEntry, Web98Copy } from './web98-copy'

/** Two touch tones per key, like a real phone line. */
const DTMF: Record<string, [number, number]> = {
  '0': [941, 1336],
  '1': [697, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
}

function modemTones(): Tone[] {
  const tones: Tone[] = [
    { f: 350, at: 0, d: 0.5, v: 0.025 },
    { f: 440, at: 0, d: 0.5, v: 0.025 },
  ]
  ;[...'08001998'].forEach((digit, i) => {
    const [low, high] = DTMF[digit]
    tones.push({ f: low, at: 0.6 + i * 0.11, d: 0.07, v: 0.03 })
    tones.push({ f: high, at: 0.6 + i * 0.11, d: 0.07, v: 0.03 })
  })
  // The answer tone, then the handshake's squeal.
  tones.push({ f: 2100, at: 1.6, d: 0.45, v: 0.018 })
  for (let i = 0; i < 18; i++) {
    tones.push({
      f: i % 2 ? 2400 : 1200,
      at: 2.1 + i * 0.045,
      d: 0.05,
      type: 'square',
      v: 0.008,
    })
  }
  tones.push({ f: 980, at: 2.9, d: 0.35, type: 'sawtooth', v: 0.006 })
  tones.push({ f: 1650, at: 2.9, d: 0.35, type: 'sawtooth', v: 0.006 })
  return tones
}

const CONNECTED: Tone[] = [
  { f: NOTE.E5, at: 0, d: 0.15, type: 'triangle', v: 0.05 },
  { f: NOTE.C6, at: 0.1, d: 0.35, type: 'triangle', v: 0.05 },
]

const STEPS_AT = [0, 1100, 2100, 3000]
const DONE_AT = 3600

/**
 * The dial-up dialog over a teal desktop: touch tones, the modem's squeal and
 * the status lines. Any key or click skips ahead; Cancel leaves 1998.
 */
export function DialUp({
  copy,
  onDone,
  onCancel,
}: {
  copy: Web98Copy
  onDone: () => void
  onCancel: () => void
}) {
  const [step, setStep] = useState(0)
  const cancel = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const stop = playTones(modemTones())
    const timers = STEPS_AT.slice(1).map((ms, i) => window.setTimeout(() => setStep(i + 1), ms))
    const done = window.setTimeout(() => {
      playTones(CONNECTED)
      onDone()
    }, DONE_AT)
    const skip = (event: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(event.key)) return
      if (event.target === cancel.current) return
      onDone()
    }
    const skipByPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && cancel.current?.contains(event.target)) return
      onDone()
    }
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skipByPointer)
    return () => {
      stop()
      for (const timer of timers) window.clearTimeout(timer)
      window.clearTimeout(done)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skipByPointer)
    }
  }, [onDone])

  return (
    <div className="w98-desktop">
      <section className="w98-dial" role="dialog" aria-modal="true" aria-label={copy.dialTitle}>
        <div className="w98-titlebar">
          <span>{copy.dialTitle}</span>
        </div>
        <div className="w98-dial-body">
          <svg viewBox="0 0 120 48" width="120" height="48" aria-hidden="true">
            <path d="M4 8h30v22H4z" fill="#c0c0c0" stroke="#000" />
            <path d="M8 12h22v14H8z" fill="#008080" />
            <path d="M12 34h14v4H12z" fill="#808080" />
            <path d="M86 8h30v22H86z" fill="#c0c0c0" stroke="#000" />
            <path d="M90 12h22v14H90z" fill="#000080" />
            <path d="M94 34h14v4H94z" fill="#808080" />
            <path d="M36 20h48" stroke="#000" strokeDasharray="3 3" />
            <circle
              className="w98-dial-packet"
              cx="40"
              cy="20"
              r="3"
              fill="#ffff00"
              stroke="#000"
            />
          </svg>
          <div>
            <p>{copy.dialNumber}</p>
            <p className="w98-dial-status" role="status">
              {copy.dialSteps[step]}
            </p>
            <div className="w98-progress" aria-hidden="true">
              <span style={{ width: `${((step + 1) / copy.dialSteps.length) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="w98-dial-actions">
          <button ref={cancel} type="button" className="w98-button" onClick={onCancel}>
            {copy.cancel}
          </button>
        </div>
      </section>
      <p className="w98-dial-skip">{copy.skip}</p>
    </div>
  )
}

/** An odometer that rolls up to this session's visitor number. */
export function VisitorCounter({ label }: { label: string }) {
  const [target, setTarget] = useState(0)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    let number = 0
    try {
      number = Number(sessionStorage.getItem('retro-1998-visitor')) || 0
    } catch {
      number = 0
    }
    if (!number) {
      number = 10_000 + Math.floor(Math.random() * 89_000)
      try {
        sessionStorage.setItem('retro-1998-visitor', String(number))
      } catch {
        // The counter simply makes up a new number next time.
      }
    }
    setTarget(number)
    if (prefersReducedMotion() || typeof requestAnimationFrame === 'undefined') {
      setShown(number)
      return
    }
    const started = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 1600)
      setShown(Math.round(number * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const digits = String(shown).padStart(6, '0')
  return (
    <p className="w98-counter">
      <span>{label}</span>{' '}
      <span className="w98-counter-digits" aria-hidden="true">
        {[...digits].map((digit, i) => (
          <span key={i}>{digit}</span>
        ))}
      </span>
      <span className="sr-only">{target || ''}</span>
    </p>
  )
}

const SPARKLE_COLORS = ['#ffff00', '#ff66ff', '#66ffff', '#ffffff', '#ff9900']

/** A trail of little stars behind the mouse. Never on touch or with reduced motion. */
export function SparkleTrail() {
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia?.('(pointer: fine)').matches) return
    const root = layer.current
    if (!root) return
    const stars = Array.from({ length: 16 }, () => {
      const star = document.createElement('span')
      star.textContent = '✦'
      root.append(star)
      return star
    })
    let next = 0
    let last = 0
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.timeStamp - last < 35) return
      last = event.timeStamp
      const star = stars[next]
      next = (next + 1) % stars.length
      if (typeof star.animate !== 'function') return
      star.style.left = `${event.clientX}px`
      star.style.top = `${event.clientY}px`
      star.style.color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)]
      const dx = (Math.random() - 0.5) * 24
      star.animate(
        [
          { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          {
            opacity: 0,
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + 22px)) scale(.3) rotate(90deg)`,
          },
        ],
        { duration: 750, easing: 'ease-out', fill: 'forwards' },
      )
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      for (const star of stars) star.remove()
    }
  }, [])

  return <div ref={layer} className="w98-sparkles" aria-hidden="true" />
}

const GUESTBOOK_KEY = 'retro-1998-guestbook'

function readEntries(): GuestEntry[] {
  try {
    const saved = JSON.parse(localStorage.getItem(GUESTBOOK_KEY) ?? '[]')
    return Array.isArray(saved)
      ? saved.filter(
          (entry): entry is GuestEntry =>
            typeof entry?.name === 'string' &&
            typeof entry?.text === 'string' &&
            typeof entry?.date === 'string',
        )
      : []
  } catch {
    return []
  }
}

const SIGNED: Tone[] = [
  { f: NOTE.C5, at: 0, d: 0.1, type: 'square', v: 0.02 },
  { f: NOTE.E5, at: 0.08, d: 0.1, type: 'square', v: 0.02 },
  { f: NOTE.G5, at: 0.16, d: 0.22, type: 'square', v: 0.02 },
]

/** The guestbook: three regulars plus whatever this browser has signed. */
export function Guestbook({
  copy,
  locale,
  onClose,
}: {
  copy: Web98Copy
  locale: string
  onClose: () => void
}) {
  const titleId = useId()
  const [entries, setEntries] = useState<GuestEntry[]>([])
  const [thanks, setThanks] = useState(false)
  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEntries(readEntries())
    firstField.current?.focus({ preventScroll: true })
  }, [])

  const sign = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      const name = String(form.get('name') ?? '').trim()
      const text = String(form.get('text') ?? '').trim()
      if (!name || !text) return
      // Signed today, but in 1998.
      const today = new Date()
      const day = String(today.getDate()).padStart(2, '0')
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const date = locale === 'en' ? `${month}/${day}/1998` : `${day}/${month}/1998`
      const next = [{ name, text, date }, ...readEntries()].slice(0, 20)
      try {
        localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(next))
      } catch {
        // Without storage the entry lasts until the window closes.
      }
      setEntries(next)
      setThanks(true)
      playTones(SIGNED)
      event.currentTarget.reset()
    },
    [locale],
  )

  return (
    <section
      className="w98-window w98-guestbook"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose()
        }
      }}
    >
      <div className="w98-titlebar">
        <span id={titleId}>{copy.guestTitle}</span>
        <button type="button" className="w98-titlebutton" aria-label={copy.close} onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="w98-guestbook-body">
        <p className="w98-guestbook-lead">{copy.guestLead}</p>
        <form className="w98-guestbook-form" onSubmit={sign}>
          <label>
            {copy.name}
            <input ref={firstField} name="name" maxLength={32} required autoComplete="nickname" />
          </label>
          <label>
            {copy.message}
            <textarea name="text" maxLength={140} required rows={2} />
          </label>
          <button type="submit" className="w98-button">
            {copy.sign}
          </button>
        </form>
        {thanks ? (
          <p className="w98-guestbook-thanks" role="status">
            {copy.thanks}
          </p>
        ) : null}
        <ol className="w98-guestbook-entries">
          {[...entries, ...copy.seeded].map((entry, i) => (
            <li key={`${entry.date}-${i}`}>
              <p>
                <strong>{entry.name}</strong> <span>{entry.date}</span>
              </p>
              <p>{entry.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** An original little tune, in the spirit of a homepage's background MIDI. */
const BEAT = 0.28
const MELODY: [keyof typeof NOTE, number][] = [
  ['C5', 1],
  ['E5', 1],
  ['G5', 1],
  ['E5', 1],
  ['F5', 1],
  ['A5', 1],
  ['G5', 2],
  ['D5', 1],
  ['F5', 1],
  ['E5', 1],
  ['C5', 1],
  ['D5', 1],
  ['B4', 1],
  ['C5', 2],
]
const BASS: (keyof typeof NOTE)[] = ['C4', 'F4', 'G4', 'C4']

function loopTones(): { tones: Tone[]; length: number } {
  const tones: Tone[] = []
  let at = 0
  for (const [note, beats] of MELODY) {
    tones.push({ f: NOTE[note], at, d: beats * BEAT * 0.9, type: 'square', v: 0.016 })
    at += beats * BEAT
  }
  BASS.forEach((note, bar) => {
    tones.push({ f: NOTE[note], at: bar * 4 * BEAT, d: 4 * BEAT * 0.95, type: 'triangle', v: 0.03 })
  })
  return { tones, length: at }
}

/** Plays the tune on a loop until stopped, unmounted or the sound is switched off. */
export function useMidi(soundOn: boolean) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing || !soundOn) return
    const { tones, length } = loopTones()
    let stop = playTones(tones)
    const loop = window.setInterval(() => {
      stop = playTones(tones)
    }, length * 1000)
    return () => {
      window.clearInterval(loop)
      stop()
    }
  }, [playing, soundOn])

  useEffect(() => {
    if (!soundOn) setPlaying(false)
  }, [soundOn])

  const toggle = useCallback(() => setPlaying((on) => !on), [])
  return { playing, toggle, stop: useCallback(() => setPlaying(false), []) }
}
