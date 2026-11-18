/**
 * The seasons the site dresses up for, by the visitor's local date. The init script
 * in the locale <head> repeats this calendar in plain JS, so the page paints in season;
 * a test checks both agree for every day of 2026 to 2040.
 */

/** A window edge: a fixed day, or a number of days from Easter Sunday. */
export type SeasonEdge = { month: number; day: number } | { easter: number }

export const SEASONS = [
  { id: 'reveillon', from: { month: 12, day: 27 }, to: { month: 1, day: 6 } },
  { id: 'natal', from: { month: 11, day: 25 }, to: { month: 12, day: 26 } },
] as const satisfies readonly { id: string; from: SeasonEdge; to: SeasonEdge }[]

export type SeasonId = (typeof SEASONS)[number]['id']
export type SeasonRule = { id: SeasonId; from: SeasonEdge; to: SeasonEdge }

/**
 * One season's dates in one edition, as yyyymmdd numbers. The edition is the year the
 * window starts: 1 January 2027 belongs to the 2026 New Year's season.
 */
export type SeasonWindow = { id: SeasonId; edition: number; from: number; to: number }

/** `?epoca=natal` previews a season for the tab; `?epoca=off` hides it. */
export const SEASON_PARAM = 'epoca'
/** sessionStorage: a SeasonId or 'off', set by the preview param. */
export const SEASON_PREVIEW_KEY = 'season-preview'
export const SEASON_OFF_PREFIX = 'season-off:'
/** The home page in each locale (localePrefix "as-needed"): where the portrait lives. */
export const SEASON_HOME_PATHS = ['/', '/en', '/es'] as const

/** Gregorian Easter Sunday at local midnight (Meeus/Jones/Butcher). */
export function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const n = h + l - 7 * m + 114
  return new Date(year, Math.floor(n / 31) - 1, (n % 31) + 1)
}

const dayKey = (date: Date) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()

function edgeDate(edge: SeasonEdge, year: number): Date {
  if ('easter' in edge) {
    const easter = easterSunday(year)
    return new Date(year, easter.getMonth(), easter.getDate() + edge.easter)
  }
  return new Date(year, edge.month - 1, edge.day)
}

/** Every season's window for the edition `year`; an end before the start lands next year. */
export function seasonWindows(
  year: number,
  rules: readonly SeasonRule[] = SEASONS,
): SeasonWindow[] {
  return rules.map(({ id, from, to }) => {
    const start = dayKey(edgeDate(from, year))
    let end = dayKey(edgeDate(to, year))
    if (end < start) end = dayKey(edgeDate(to, year + 1))
    return { id, edition: year, from: start, to: end }
  })
}

/** The season on this local date, with its edition. */
export function seasonWindowOn(
  date: Date,
  rules: readonly SeasonRule[] = SEASONS,
): { id: SeasonId; edition: number } | null {
  const today = dayKey(date)
  const year = date.getFullYear()
  const window = [...seasonWindows(year - 1, rules), ...seasonWindows(year, rules)].find(
    ({ from, to }) => today >= from && today <= to,
  )
  return window ? { id: window.id, edition: window.edition } : null
}

export function seasonOn(date: Date): SeasonId | null {
  return seasonWindowOn(date)?.id ?? null
}

/** The edition of `id` in course on this date, or else the next one (for previews). */
export function seasonEdition(id: SeasonId, date: Date): number {
  const today = dayKey(date)
  const year = date.getFullYear()
  for (const edition of [year - 1, year, year + 1]) {
    const window = seasonWindows(edition).find((w) => w.id === id)
    if (window && today <= window.to) return edition
  }
  return year + 1
}

export function parseSeason(value: string | null): SeasonId | null {
  return SEASONS.find(({ id }) => id === value)?.id ?? null
}

/** Turning a season off lasts for that edition only: it comes back the next year. */
export function seasonOffKey(id: SeasonId, edition: number): string {
  return `${SEASON_OFF_PREFIX}${id}-${edition}`
}
