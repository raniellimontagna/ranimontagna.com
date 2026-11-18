import { easterSunday } from '@/shared/lib/seasons/seasons'

const DAY_MS = 86_400_000

export type EasterCountdown = { kind: 'days'; days: number } | { kind: 'easter' }

/** Days to Easter Sunday; on Sunday and the Monday after, a happy Easter. */
export function easterCountdown(now: Date, edition: number): EasterCountdown {
  const easter = easterSunday(edition)
  const sunday = Date.UTC(edition, easter.getMonth(), easter.getDate())
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((sunday - today) / DAY_MS)
  return days > 0 ? { kind: 'days', days } : { kind: 'easter' }
}
