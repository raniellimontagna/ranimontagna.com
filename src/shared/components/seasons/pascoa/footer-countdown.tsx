'use client'

import { createPortal } from 'react-dom'
import { fill } from '../shared/fill'
import { useSlots } from '../shared/use-slots'
import { useToday } from '../shared/use-today'
import { easterCountdown } from './countdown'
import { getPascoaCopy } from './pascoa-copy'
import { EggIcon } from './pascoa-icons'

/** The footer counts down to Easter Sunday, on every page. */
export function FooterCountdown({ locale, edition }: { locale: string; edition: number }) {
  const [slot] = useSlots('[data-season-slot="footer"]')
  const today = useToday()

  if (!slot) return null

  const copy = getPascoaCopy(locale)
  const countdown = easterCountdown(today, edition)
  const text =
    countdown.kind === 'easter'
      ? copy.easter
      : countdown.days === 1
        ? copy.oneDay
        : fill(copy.manyDays, { n: countdown.days })

  return createPortal(
    <span className="pascoa-countdown">
      <EggIcon index={2} />
      <span>{text}</span>
    </span>,
    slot,
  )
}
