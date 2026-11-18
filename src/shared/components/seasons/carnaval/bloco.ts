/** "Name your bloco": which name was drawn, kept per season edition. */

/** A random name, never the one on the banner now. */
export function pickBloco(count: number, previous: number | null, rand: () => number): number {
  const index = Math.floor(rand() * count)
  if (index !== previous || count < 2) return index
  return (index + 1 + Math.floor(rand() * (count - 1))) % count
}

const blocoKey = (edition: number) => `season-bloco:carnaval-${edition}`

export function loadBloco(edition: number, count: number): number | null {
  try {
    const raw = localStorage.getItem(blocoKey(edition))
    const value = raw === null ? Number.NaN : Number(raw)
    return Number.isInteger(value) && value >= 0 && value < count ? value : null
  } catch {
    return null
  }
}

export function saveBloco(edition: number, index: number): void {
  try {
    localStorage.setItem(blocoKey(edition), String(index))
  } catch {
    // The banner still shows the name for this visit.
  }
}
