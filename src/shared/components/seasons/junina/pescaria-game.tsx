'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '@/shared/components/motion'
import { track } from '@/shared/lib/analytics/track'
import { fill } from '../shared/fill'
import { SoundIcon } from '../shared/sound-icon'
import { SoundToggle } from '../shared/sound-toggle'
import { useSlots } from '../shared/use-slots'
import { getJuninaCopy } from './junina-copy'
import { playAccordion } from './junina-sound'
import { FISH_COUNT, loadCaught, saveCaught } from './pescaria'

const COLORS = ['red', 'yellow', 'blue', 'green', 'fire'] as const
/** How long a hooked fish takes to leap out of the pond. */
const LEAP_MS = 650

type PescariaProps = {
  locale: string
  edition: number
  /** The fifth fish was just hooked. */
  onComplete: () => void
  /** The visitor asks for the prize card again. */
  onReopen: () => void
}

function FishShape() {
  return (
    <svg viewBox="0 0 64 36" aria-hidden="true" className="junina-fish-shape">
      <circle cx="30" cy="4" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 20c8-11 26-13 38-1-12 12-30 10-38 1Z" className="junina-fish-body" />
      <path d="M46 19l14-9v18Z" className="junina-fish-body" />
      <path d="M22 13v13M30 12v15" className="junina-fish-stripe" />
      <circle cx="15" cy="18" r="2" fill="currentColor" />
    </svg>
  )
}

/**
 * The Festa Junina's game at the end of the home page: five paper fish swim in a pond;
 * each is a real button (it stops when hovered or focused), and each catch brings a prize.
 * With reduced motion the fish wait in place.
 */
export function PescariaGame({ locale, edition, onComplete, onReopen }: PescariaProps) {
  const copy = getJuninaCopy(locale)
  const [slot] = useSlots('[data-season-slot="play"]')
  const [caught, setCaught] = useState(() => loadCaught(edition))
  const [leaping, setLeaping] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const caughtRef = useRef(caught)
  const leapTimer = useRef(0)

  useEffect(() => () => window.clearTimeout(leapTimer.current), [])

  const hook = (index: number) => {
    const previous = caughtRef.current
    if (previous.includes(index)) return
    const next = [...previous, index].sort((a, b) => a - b)
    caughtRef.current = next
    saveCaught(edition, next)
    const prize = copy.prizes[index]
    setMessage(fill(copy.won, { prize: `${prize.name}, ${prize.line}` }))
    playAccordion()
    track('season-gift', { season: 'junina', gift: prize.name, found: next.length })
    const land = () => {
      setLeaping(null)
      setCaught(next)
      if (next.length === FISH_COUNT) onComplete()
    }
    if (prefersReducedMotion()) {
      land()
      return
    }
    setLeaping(index)
    window.clearTimeout(leapTimer.current)
    leapTimer.current = window.setTimeout(land, LEAP_MS)
  }

  if (!slot) return null
  const done = caught.length >= FISH_COUNT

  return createPortal(
    <section
      aria-labelledby="junina-pescaria-title"
      className="junina-pescaria"
      data-no-season-click
      data-pescaria
    >
      <div className="junina-pescaria-head">
        <h2 id="junina-pescaria-title" className="junina-pescaria-title">
          {copy.title}
        </h2>
        <p className="junina-pescaria-intro">{copy.intro}</p>
      </div>
      <div className="junina-pond">
        {copy.prizes.map((prize, index) =>
          caught.includes(index) ? null : (
            <button
              key={prize.name}
              type="button"
              data-fish={index}
              data-leaping={leaping === index || undefined}
              aria-label={fill(copy.fish, { n: index + 1, total: FISH_COUNT })}
              onClick={() => hook(index)}
              className="junina-fish"
              data-color={COLORS[index]}
              style={{ '--row': index, '--swim': `${9 + ((index * 7) % 6)}s` } as CSSProperties}
            >
              <FishShape />
            </button>
          ),
        )}
      </div>
      <div className="junina-pescaria-controls">
        {done ? (
          <button type="button" onClick={onReopen} className="junina-pescaria-button">
            {copy.openCard}
          </button>
        ) : null}
        <span className="junina-pescaria-progress">
          {fill(copy.progress, { n: caught.length })}
        </span>
        <ol className="junina-prizes" aria-label={copy.prizesLabel}>
          {caught.map((index) => (
            <li key={copy.prizes[index].name} data-color={COLORS[index]}>
              <strong>{copy.prizes[index].name}</strong> · {copy.prizes[index].line}
            </li>
          ))}
        </ol>
        <SoundToggle
          label={copy.sound}
          className="junina-pescaria-sound"
          icon={(on) => <SoundIcon on={on} />}
        />
      </div>
      <p role="status" className="sr-only">
        {message}
      </p>
    </section>,
    slot,
  )
}
