'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fill } from '../shared/fill'
import { useSlots } from '../shared/use-slots'
import { midnightOf, newYearCountdown } from './countdown'
import { getReveillonCopy } from './reveillon-copy'

/** When the footer text changes next: each minute on the 31st, else at local midnight. */
function nextChange(now: Date, edition: number): number {
  const countdown = newYearCountdown(now, edition)
  if (countdown.kind === 'hours') {
    const minute = new Date(now)
    minute.setSeconds(60, 0)
    return Math.min(minute.getTime(), midnightOf(edition).getTime())
  }
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime()
}

/** The footer counts down to the new year, on every page. */
export function FooterCountdown({ locale, edition }: { locale: string; edition: number }) {
  const [slot] = useSlots('[data-season-slot="footer"]')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setTimeout(
      () => setNow(new Date()),
      Math.max(0, nextChange(now, edition) - Date.now()),
    )
    return () => window.clearTimeout(timer)
  }, [now, edition])

  if (!slot) return null

  const copy = getReveillonCopy(locale)
  const countdown = newYearCountdown(now, edition)
  const year = edition + 1
  const text =
    countdown.kind === 'days'
      ? fill(copy.manyDays, { n: countdown.days, year })
      : countdown.kind === 'hours'
        ? countdown.hours > 0
          ? fill(copy.hours, { h: countdown.hours, m: countdown.minutes, year })
          : fill(copy.minutes, { m: countdown.minutes, year })
        : fill(copy.newYear, { year: countdown.year })

  return createPortal(
    <span className="reveillon-countdown">
      <svg viewBox="0 0 16 16" aria-hidden="true" width="12" height="12">
        <path d="M8 0l1.8 6.2L16 8l-6.2 1.8L8 16l-1.8-6.2L0 8l6.2-1.8Z" fill="var(--season-gold)" />
      </svg>
      <span>{text}</span>
    </span>,
    slot,
  )
}
