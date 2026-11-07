/**
 * Anything on the page can ask for the assistant without knowing which widget
 * answers. Today the chat widget listens; Phase 3 swaps in Altair.
 */
export const ALTAIR_OPEN_EVENT = 'altair:open'

export function openAltair(): void {
  window.dispatchEvent(new Event(ALTAIR_OPEN_EVENT))
}
