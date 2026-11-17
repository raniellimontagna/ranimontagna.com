/**
 * The seasons the site dresses up for, by the visitor's local date. The init script
 * in the locale <head> embeds this same data, so the page paints in season.
 */
export const SEASONS = [
  { id: 'natal', from: { month: 12, day: 1 }, to: { month: 12, day: 26 } },
] as const

export type SeasonId = (typeof SEASONS)[number]['id']

/** `?epoca=natal` previews a season for the tab; `?epoca=off` hides it. */
export const SEASON_PARAM = 'epoca'
/** sessionStorage: a SeasonId or 'off', set by the preview param. */
export const SEASON_PREVIEW_KEY = 'season-preview'
export const SEASON_OFF_PREFIX = 'season-off:'
/** The home page in each locale (localePrefix "as-needed"): where the portrait lives. */
export const SEASON_HOME_PATHS = ['/', '/en', '/es'] as const

const dayOfYear = (month: number, day: number) => month * 100 + day

export function seasonOn(date: Date): SeasonId | null {
  const today = dayOfYear(date.getMonth() + 1, date.getDate())
  const season = SEASONS.find(
    ({ from, to }) =>
      today >= dayOfYear(from.month, from.day) && today <= dayOfYear(to.month, to.day),
  )
  return season?.id ?? null
}

export function parseSeason(value: string | null): SeasonId | null {
  return SEASONS.find(({ id }) => id === value)?.id ?? null
}

/** Turning a season off lasts for that season of that year only. */
export function seasonOffKey(id: SeasonId, year: number): string {
  return `${SEASON_OFF_PREFIX}${id}-${year}`
}
