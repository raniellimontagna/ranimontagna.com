/** The five gifts hidden on the home page, one per section, in page order. */
export const GIFT_IDS = ['ia', 'no-ar', 'trajetoria', 'atto', 'escrita'] as const
export type GiftId = (typeof GIFT_IDS)[number]

export function giftsKey(year: number): string {
  return `season-gifts:natal-${year}`
}

export function loadFound(year: number): GiftId[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(giftsKey(year)) ?? '[]')
    return Array.isArray(parsed) ? GIFT_IDS.filter((id) => parsed.includes(id)) : []
  } catch {
    return []
  }
}

export function saveFound(year: number, found: GiftId[]): void {
  try {
    localStorage.setItem(giftsKey(year), JSON.stringify(found))
  } catch {
    // The hunt still works for this visit.
  }
}

export function addFound(found: GiftId[], id: GiftId): GiftId[] {
  return GIFT_IDS.filter((gift) => gift === id || found.includes(gift))
}

export function isComplete(found: GiftId[]): boolean {
  return GIFT_IDS.every((id) => found.includes(id))
}
