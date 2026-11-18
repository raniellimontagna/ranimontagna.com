const DAY_MS = 86_400_000

export type HalloweenCountdown =
  | { kind: 'days'; days: number }
  | { kind: 'halloween' }
  | { kind: 'after' }

/** Days to 31 October of the edition; the night itself; then goodbye until next year. */
export function halloweenCountdown(now: Date, edition: number): HalloweenCountdown {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((Date.UTC(edition, 9, 31) - today) / DAY_MS)
  if (days > 0) return { kind: 'days', days }
  return days === 0 ? { kind: 'halloween' } : { kind: 'after' }
}
