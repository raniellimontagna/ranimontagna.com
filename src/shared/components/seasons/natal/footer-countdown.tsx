'use client'

import { createPortal } from 'react-dom'
import { christmasCountdown } from './countdown'
import { getNatalCopy } from './natal-copy'
import { useSlots } from './use-slots'

/** The footer counts down to the 25th, on every page. */
export function FooterCountdown({ locale }: { locale: string }) {
  const [slot] = useSlots('[data-season-slot="footer"]')
  if (!slot) return null

  const copy = getNatalCopy(locale)
  const countdown = christmasCountdown(new Date())
  const text =
    countdown.kind === 'christmas'
      ? copy.christmas
      : countdown.kind === 'after'
        ? copy.after
        : countdown.days === 1
          ? copy.oneDay
          : copy.manyDays.replace('{n}', String(countdown.days))

  return createPortal(
    <span className="natal-countdown">
      <svg viewBox="0 0 16 16" aria-hidden="true" width="12" height="12">
        <path d="M8 0l1.8 6.2L16 8l-6.2 1.8L8 16l-1.8-6.2L0 8l6.2-1.8Z" fill="var(--season-gold)" />
      </svg>
      <span>{text}</span>
    </span>,
    slot,
  )
}
