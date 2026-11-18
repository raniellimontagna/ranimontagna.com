import { easterSunday } from '@/shared/lib/seasons/seasons'

const DAY_MS = 86_400_000

export type CarnavalCountdown =
  | { kind: 'days'; days: number }
  | { kind: 'carnaval' }
  | { kind: 'ashes' }

/** Days to the Saturday of Carnival (Easter − 50); Saturday to Tuesday; then Ash Wednesday. */
export function carnavalCountdown(now: Date, edition: number): CarnavalCountdown {
  const easter = easterSunday(edition)
  const day = (offset: number) => Date.UTC(edition, easter.getMonth(), easter.getDate() + offset)
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  if (today >= day(-46)) return { kind: 'ashes' }
  if (today >= day(-50)) return { kind: 'carnaval' }
  return { kind: 'days', days: Math.round((day(-50) - today) / DAY_MS) }
}
