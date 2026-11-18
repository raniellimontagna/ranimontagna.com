import type { SeasonId } from '@/shared/lib/seasons/seasons'

/**
 * The five spots on the home page where a season hides things (gifts, eggs, bugs), one
 * per section, in page order. Only in sections that always render: the blog section
 * steps aside when the blog is down, and a missing spot would make the hunt impossible.
 */
export const HUNT_SPOTS = ['ia', 'no-ar', 'trajetoria', 'atto', 'contato'] as const
export type HuntSpot = (typeof HUNT_SPOTS)[number]

/** Christmas's key since 2026, kept as is so its progress survives. */
export function huntKey(season: SeasonId, edition: number): string {
  return `season-gifts:${season}-${edition}`
}

export function loadFound(season: SeasonId, edition: number): HuntSpot[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(huntKey(season, edition)) ?? '[]')
    return Array.isArray(parsed) ? HUNT_SPOTS.filter((id) => parsed.includes(id)) : []
  } catch {
    return []
  }
}

export function saveFound(season: SeasonId, edition: number, found: HuntSpot[]): void {
  try {
    localStorage.setItem(huntKey(season, edition), JSON.stringify(found))
  } catch {
    // The hunt still works for this visit.
  }
}

export function addFound(found: HuntSpot[], id: HuntSpot): HuntSpot[] {
  return HUNT_SPOTS.filter((spot) => spot === id || found.includes(spot))
}

export function isComplete(found: HuntSpot[]): boolean {
  return HUNT_SPOTS.every((id) => found.includes(id))
}

export function asHuntSpot(value: string | null): HuntSpot | null {
  return HUNT_SPOTS.includes(value as HuntSpot) ? (value as HuntSpot) : null
}
