const DAY_MS = 86_400_000

export type ProgramadorCountdown =
  | { kind: 'days'; days: number }
  | { kind: 'day' }
  | { kind: 'after' }

/** Days to day 256 of the edition (12 September in a leap year); the day itself; then after. */
export function programadorCountdown(now: Date, edition: number): ProgramadorCountdown {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((Date.UTC(edition, 0, 256) - today) / DAY_MS)
  if (days > 0) return { kind: 'days', days }
  return days === 0 ? { kind: 'day' } : { kind: 'after' }
}
