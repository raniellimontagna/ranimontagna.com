export type ChristmasCountdown =
  | { kind: 'days'; days: number }
  | { kind: 'christmas' }
  | { kind: 'after' }

const DAY_MS = 86_400_000

/** Calendar days to the 25th, by the visitor's local date; the day itself; and after. */
export function christmasCountdown(date: Date): ChristmasCountdown {
  const year = date.getFullYear()
  const today = Date.UTC(year, date.getMonth(), date.getDate())
  const christmas = Date.UTC(year, 11, 25)
  const days = Math.round((christmas - today) / DAY_MS)
  if (days > 0) return { kind: 'days', days }
  return days === 0 ? { kind: 'christmas' } : { kind: 'after' }
}
