'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '@/shared/components/motion'
import { track } from '@/shared/lib/analytics/track'
import { fill } from '../shared/fill'
import { recordCompleteOnce } from '../shared/hunt'
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
 * each is a real button (it waits when hovered or focused, and a switch stops them all),
 * and each catch brings a prize. With reduced motion the fish wait in place. Keyboard
 * focus moves to the next fish after a catch, and to the prizes button at the end.
 */
export function PescariaGame({ locale, edition, onComplete, onReopen }: PescariaProps) {
  const copy = getJuninaCopy(locale)
  const [slot] = useSlots('[data-season-slot="play"]')
  const [caught, setCaught] = useState(() => loadCaught(edition))
  const [leaping, setLeaping] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [stopped, setStopped] = useState(false)
  const caughtRef = useRef(caught)
  const timers = useRef(new Map<number, number>())
  const pondRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  /** Set when a focused fish leaves: the next render moves focus on (and, at the end, opens the card). */
  const refocus = useRef<{ finished: boolean } | null>(null)

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending.values()) window.clearTimeout(timer)
    }
  }, [])

  // The fish rest while the pond is off screen.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the section mounts once the slot is found.
  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver !== 'function') return
    const seen = new IntersectionObserver(([entry]) => {
      section.toggleAttribute('data-season-idle', entry ? !entry.isIntersecting : false)
    })
    seen.observe(section)
    return () => seen.disconnect()
  }, [slot])

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs after each landing, which changes `caught`.
  useEffect(() => {
    const pending = refocus.current
    if (!pending) return
    refocus.current = null
    const next =
      pondRef.current?.querySelector<HTMLButtonElement>('[data-fish]:not([data-leaping])') ??
      sectionRef.current?.querySelector<HTMLButtonElement>('[data-prizes-button]')
    next?.focus()
    // Opened after the focus moved, so the card gives it back to the prizes button.
    if (pending.finished) onComplete()
  }, [caught])

  const hook = (index: number, button: HTMLButtonElement) => {
    const previous = caughtRef.current
    if (previous.includes(index)) return
    const next = [...previous, index].sort((a, b) => a - b)
    caughtRef.current = next
    saveCaught(edition, next)
    const prize = copy.prizes[index]
    setMessage(fill(copy.won, { prize: `${prize.name}, ${prize.line}` }))
    playAccordion()
    track('season-gift', { season: 'junina', gift: prize.name, found: next.length })
    const finished = next.length === FISH_COUNT
    if (finished) recordCompleteOnce('junina', edition)
    const hadFocus = document.activeElement === button
    const land = () => {
      timers.current.delete(index)
      setLeaping((list) => list.filter((fish) => fish !== index))
      if (hadFocus || finished) refocus.current = { finished }
      // Only this fish lands: another may still be in the air.
      setCaught((list) => [...list, index].sort((a, b) => a - b))
    }
    if (prefersReducedMotion()) {
      land()
      return
    }
    setLeaping((list) => [...list, index])
    timers.current.set(index, window.setTimeout(land, LEAP_MS))
  }

  if (!slot) return null
  const done = caught.length >= FISH_COUNT

  return createPortal(
    <section
      ref={sectionRef}
      aria-labelledby="junina-pescaria-title"
      className="junina-pescaria"
      data-no-season-click
      data-pescaria
      data-stopped={stopped || undefined}
    >
      <div className="junina-pescaria-head">
        <h2 id="junina-pescaria-title" className="junina-pescaria-title">
          {copy.title}
        </h2>
        <p className="junina-pescaria-intro">{copy.intro}</p>
      </div>
      <div ref={pondRef} className="junina-pond">
        {copy.prizes.map((prize, index) => {
          if (caught.includes(index)) return null
          const isLeaping = leaping.includes(index)
          return (
            <button
              key={prize.name}
              type="button"
              data-fish={index}
              data-side={index % 2 ? 'right' : 'left'}
              data-leaping={isLeaping || undefined}
              aria-disabled={isLeaping || undefined}
              aria-label={fill(copy.fish, { n: index + 1, total: FISH_COUNT })}
              onClick={(event) => hook(index, event.currentTarget)}
              className="junina-fish"
              data-color={COLORS[index]}
              style={{ '--row': index, '--swim': `${9 + ((index * 7) % 6)}s` } as CSSProperties}
            >
              <FishShape />
            </button>
          )
        })}
      </div>
      <div className="junina-pescaria-controls">
        {done ? (
          <button
            type="button"
            data-prizes-button
            onClick={onReopen}
            className="junina-pescaria-button"
          >
            {copy.openCard}
          </button>
        ) : (
          <button
            type="button"
            aria-pressed={stopped}
            onClick={() => setStopped((value) => !value)}
            className="junina-pescaria-stop"
          >
            {copy.stopFish}
          </button>
        )}
        <span className="junina-pescaria-progress">
          {fill(copy.progress, { n: caught.length, total: FISH_COUNT })}
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
