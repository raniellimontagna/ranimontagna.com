'use client'

import { createPortal } from 'react-dom'
import { fill } from '../shared/fill'
import { useSlots } from '../shared/use-slots'
import { useToday } from '../shared/use-today'
import { halloweenCountdown } from './countdown'
import { getHalloweenCopy } from './halloween-copy'
import { PumpkinIcon } from './halloween-icons'

/** The footer counts down to Halloween night, on every page. */
export function FooterCountdown({ locale }: { locale: string }) {
  const [slot] = useSlots('[data-season-slot="footer"]')
  const today = useToday()

  if (!slot) return null

  const copy = getHalloweenCopy(locale)
  const countdown = halloweenCountdown(today)
  const text =
    countdown.kind === 'halloween'
      ? copy.halloween
      : countdown.kind === 'after'
        ? copy.after
        : countdown.days === 1
          ? copy.oneDay
          : fill(copy.manyDays, { n: countdown.days })

  return createPortal(
    <span className="halloween-countdown">
      <PumpkinIcon />
      <span>{text}</span>
    </span>,
    slot,
  )
}
