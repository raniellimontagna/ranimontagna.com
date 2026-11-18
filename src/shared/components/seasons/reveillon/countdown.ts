const DAY_MS = 86_400_000
const MINUTE_MS = 60_000

export type NewYearCountdown =
  | { kind: 'days'; days: number }
  | { kind: 'hours'; hours: number; minutes: number }
  | { kind: 'new-year'; year: number }

/** Local midnight that opens the year after the edition: 1 January of `edition + 1`. */
export function midnightOf(edition: number): Date {
  return new Date(edition + 1, 0, 1)
}

/** Days to the new year by the calendar; on the 31st, hours and minutes; then the year. */
export function newYearCountdown(now: Date, edition: number): NewYearCountdown {
  const midnight = midnightOf(edition)
  if (now >= midnight) return { kind: 'new-year', year: edition + 1 }
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((Date.UTC(edition + 1, 0, 1) - today) / DAY_MS)
  if (days > 1) return { kind: 'days', days }
  const minutes = Math.ceil((midnight.getTime() - now.getTime()) / MINUTE_MS)
  return { kind: 'hours', hours: Math.floor(minutes / 60), minutes: minutes % 60 }
}

/** `?virada=15` simulates midnight 15 s after the page opens (5 to 120 s), for previews. */
export function viradaFromParam(search: string, now: number): number | null {
  const value = Number(new URLSearchParams(search).get('virada'))
  return Number.isInteger(value) && value >= 5 && value <= 120 ? now + value * 1000 : null
}
