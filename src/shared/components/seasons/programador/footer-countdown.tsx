'use client'

import { createPortal } from 'react-dom'
import { fill } from '../shared/fill'
import { useSlots } from '../shared/use-slots'
import { useToday } from '../shared/use-today'
import { programadorCountdown } from './countdown'
import { getProgramadorCopy } from './programador-copy'

/** The footer counts down to day 256, on every page. */
export function FooterCountdown({ locale, edition }: { locale: string; edition: number }) {
  const [slot] = useSlots('[data-season-slot="footer"]')
  const today = useToday()

  if (!slot) return null

  const copy = getProgramadorCopy(locale)
  const countdown = programadorCountdown(today, edition)
  const text =
    countdown.kind === 'day'
      ? copy.day
      : countdown.kind === 'after'
        ? copy.after
        : countdown.days === 1
          ? copy.oneDay
          : fill(copy.manyDays, { n: countdown.days })

  return createPortal(
    <span className="programador-countdown" data-after={countdown.kind === 'after' || undefined}>
      <svg viewBox="0 0 16 16" aria-hidden="true" width="12" height="12">
        <path
          d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4"
          fill="none"
          stroke="var(--season-keyword)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{text}</span>
    </span>,
    slot,
  )
}
