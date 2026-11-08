/**
 * Anything on the page can ask for Vega without knowing which component
 * answers: the launcher, the hero button, the 404 page and ⌘K all use this.
 */
export const VEGA_OPEN_EVENT = 'vega:open'

export function openVega(): void {
  window.dispatchEvent(new Event(VEGA_OPEN_EVENT))
}
