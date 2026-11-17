'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { christmasCountdown } from './countdown'
import { getNatalCopy } from './natal-copy'
import { useSlots } from './use-slots'

/** The footer counts down to the 25th, on every page. */
export function FooterCountdown({ locale }: { locale: string }) {
  const [slot] = useSlots('[data-season-slot="footer"]')
  const [today, setToday] = useState(() => new Date())

  // A page left open overnight turns the day at local midnight.
  useEffect(() => {
    const midnight = new Date(today)
    midnight.setHours(24, 0, 0, 0)
    const timer = window.setTimeout(() => setToday(new Date()), midnight.getTime() - Date.now())
    return () => window.clearTimeout(timer)
  }, [today])

  if (!slot) return null

  const copy = getNatalCopy(locale)
  const countdown = christmasCountdown(today)
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
