/** The fishing game's catch, kept per season edition: indexes of the fish hooked. */

export const FISH_COUNT = 5

const pescaKey = (edition: number) => `season-pesca:junina-${edition}`

export function loadCaught(edition: number): number[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(pescaKey(edition)) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return Array.from({ length: FISH_COUNT }, (_, i) => i).filter((i) => parsed.includes(i))
  } catch {
    return []
  }
}

export function saveCaught(edition: number, caught: number[]): void {
  try {
    localStorage.setItem(pescaKey(edition), JSON.stringify(caught))
  } catch {
    // The game still works for this visit.
  }
}
