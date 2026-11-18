'use client'

import { createPortal } from 'react-dom'
import { fill } from '../shared/fill'
import { useSlots } from '../shared/use-slots'
import { useToday } from '../shared/use-today'
import { juninaCountdown } from './countdown'
import { getJuninaCopy } from './junina-copy'

/** The footer counts down to São João, on every page. */
export function FooterCountdown({ locale, edition }: { locale: string; edition: number }) {
  const [slot] = useSlots('[data-season-slot="footer"]')
  const today = useToday()

  if (!slot) return null

  const copy = getJuninaCopy(locale)
  const countdown = juninaCountdown(today, edition)
  const text =
    countdown.kind === 'sao-joao'
      ? copy.saoJoao
      : countdown.kind === 'arraia'
        ? copy.arraia
        : countdown.days === 1
          ? copy.oneDay
          : fill(copy.manyDays, { n: countdown.days })

  return createPortal(
    <span className="junina-countdown">
      <svg viewBox="0 0 16 16" aria-hidden="true" width="12" height="12">
        <path d="M2 3h5v6L4.5 7 2 9Z" fill="var(--season-red)" />
        <path d="M9 3h5v6l-2.5-2L9 9Z" fill="var(--season-blue)" />
        <path d="M1 3h14" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span>{text}</span>
    </span>,
    slot,
  )
}
