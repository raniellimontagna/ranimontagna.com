'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { track } from '@/shared/lib/analytics/track'
import { fill } from '../shared/fill'
import { recordCompleteOnce } from '../shared/hunt'
import { SoundIcon } from '../shared/sound-icon'
import { SoundToggle } from '../shared/sound-toggle'
import { useSlots } from '../shared/use-slots'
import { getProgramadorCopy } from './programador-copy'
import { playHit, playKey } from './programador-sound'
import { loadApproved, PR_COUNT, saveApproved } from './review'

type ReviewGameProps = {
  locale: string
  edition: number
  /** The fifth bug was just found. */
  onComplete: () => void
  /** The visitor asks for the approval card again. */
  onReopen: () => void
}

/**
 * Programmer's Day's game at the end of the home page: five pull requests, one at a time,
 * each with one line that has a bug. Every line is a button; a clean line says so and
 * lets the visitor try again, the bug line explains itself. Progress is kept per edition.
 * Keyboard focus moves to "Next PR" after a find, to the first line of the next PR, and to
 * the approval button at the end.
 */
export function ReviewGame({ locale, edition, onComplete, onReopen }: ReviewGameProps) {
  const copy = getProgramadorCopy(locale)
  const [slot] = useSlots('[data-season-slot="play"]')
  const [approved, setApproved] = useState(() => loadApproved(edition))
  /** The PR on screen: the next to review, or the one whose bug was just found. */
  const [current, setCurrent] = useState(approved)
  const [cleared, setCleared] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const sectionRef = useRef<HTMLElement>(null)
  /** Where focus goes after the next render, and whether the card opens then. */
  const refocus = useRef<{ to: 'next' | 'line'; finished: boolean } | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs after a find or a new PR.
  useEffect(() => {
    const pending = refocus.current
    if (!pending) return
    refocus.current = null
    const target =
      pending.to === 'next'
        ? sectionRef.current?.querySelector<HTMLButtonElement>('[data-review-next]')
        : sectionRef.current?.querySelector<HTMLButtonElement>('[data-line]')
    target?.focus()
    // Opened after the focus moved, so the card gives it back to the approval button.
    if (pending.finished) onComplete()
  }, [approved, current])

  const done = current >= PR_COUNT
  const pr = done ? null : copy.prs[current]
  const found = !done && approved > current

  const review = (line: number) => {
    if (!pr || found) return
    if (line !== pr.bug) {
      setCleared((list) => (list.includes(line) ? list : [...list, line]))
      setMessage(fill(copy.clean, { n: line + 1 }))
      playKey()
      return
    }
    const next = current + 1
    // Another tab may be further on: never move the saved progress back, nor count a PR twice.
    const saved = loadApproved(edition)
    if (next > saved) {
      saveApproved(edition, next)
      track('season-gift', { season: 'programador', gift: `pr-${next}`, found: next })
    }
    setMessage(fill(copy.found, { n: line + 1 }))
    playHit()
    const finished = next === PR_COUNT
    if (finished) recordCompleteOnce('programador', edition)
    refocus.current = { to: 'next', finished }
    setApproved(next)
  }

  const goNext = () => {
    if (current + 1 >= PR_COUNT) {
      onReopen()
      return
    }
    const upcoming = current + 1
    setCleared([])
    // Focus lands on the first line: the status names the new PR.
    setMessage(
      fill(copy.prHeading, { n: upcoming + 1, total: PR_COUNT, title: copy.prs[upcoming].title }),
    )
    refocus.current = { to: 'line', finished: false }
    setCurrent(upcoming)
  }

  if (!slot) return null

  return createPortal(
    <section
      ref={sectionRef}
      aria-labelledby="programador-review-title"
      className="programador-review"
      data-no-season-click
      data-review
    >
      <div className="programador-review-head">
        <h2 id="programador-review-title" className="programador-review-title">
          {copy.title}
        </h2>
        <p className="programador-review-intro">{done ? copy.doneIntro : copy.intro}</p>
      </div>
      {pr ? (
        <div className="programador-pr" data-found={found || undefined}>
          <h3 className="programador-pr-title">
            {fill(copy.prHeading, { n: current + 1, total: PR_COUNT, title: pr.title })}
          </h3>
          <ol className="programador-code">
            {pr.lines.map((code, index) => {
              const state =
                found && index === pr.bug ? 'bug' : cleared.includes(index) ? 'ok' : undefined
              return (
                <li key={index}>
                  <button
                    type="button"
                    data-line={index}
                    data-state={state}
                    aria-disabled={found || undefined}
                    aria-label={fill(
                      state === 'bug' ? copy.lineBug : state === 'ok' ? copy.lineOk : copy.line,
                      { n: index + 1, code: code.trim() },
                    )}
                    onClick={() => review(index)}
                    className="programador-line"
                  >
                    <span aria-hidden="true" className="programador-line-number">
                      {index + 1}
                    </span>
                    <code className="programador-line-code">{code}</code>
                  </button>
                </li>
              )
            })}
          </ol>
          {found ? (
            <p id="programador-why" className="programador-why">
              {pr.why}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="programador-review-controls">
        {found || done ? (
          <button
            type="button"
            data-review-next
            aria-describedby={found ? 'programador-why' : undefined}
            onClick={done ? onReopen : goNext}
            className="programador-review-button"
          >
            {done || current + 1 >= PR_COUNT ? copy.approve : copy.next}
          </button>
        ) : null}
        <span className="programador-review-progress">
          {fill(copy.progress, { n: approved, total: PR_COUNT })}
        </span>
        <SoundToggle
          label={copy.sound}
          className="programador-review-sound"
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
