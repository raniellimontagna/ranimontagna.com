'use client'

import { createPortal } from 'react-dom'
import { fill } from '../shared/fill'
import { useSlots } from '../shared/use-slots'
import { useToday } from '../shared/use-today'
import { getCarnavalCopy } from './carnaval-copy'
import { carnavalCountdown } from './countdown'

/** The footer counts down to the Saturday of Carnival, on every page. */
export function FooterCountdown({ locale, edition }: { locale: string; edition: number }) {
  const [slot] = useSlots('[data-season-slot="footer"]')
  const today = useToday()

  if (!slot) return null

  const copy = getCarnavalCopy(locale)
  const countdown = carnavalCountdown(today, edition)
  const text =
    countdown.kind === 'carnaval'
      ? copy.carnaval
      : countdown.kind === 'ashes'
        ? copy.ashes
        : countdown.days === 1
          ? copy.oneDay
          : fill(copy.manyDays, { n: countdown.days })

  return createPortal(
    <span className="carnaval-countdown">
      <svg viewBox="0 0 16 16" aria-hidden="true" width="12" height="12">
        <circle cx="4" cy="5" r="2.2" fill="var(--season-magenta)" />
        <circle cx="11" cy="4" r="1.8" fill="var(--season-yellow)" />
        <circle cx="8" cy="11" r="2.4" fill="var(--season-cyan)" />
      </svg>
      <span>{text}</span>
    </span>,
    slot,
  )
}
