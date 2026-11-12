/**
 * Anything on the page can ask for Vega without knowing which component
 * answers: the launcher, the hero button, the 404 page and ⌘K all use this.
 */
export const VEGA_OPEN_EVENT = 'vega:open'

/** Also a 10 ms tap on phones that can vibrate (Android); iOS has no vibrate. */
export function openVega(): void {
  navigator.vibrate?.(10)
  window.dispatchEvent(new Event(VEGA_OPEN_EVENT))
}
