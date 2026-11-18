/**
 * Controls and panels a click belongs to. Vega and the site menu are role="dialog" divs
 * above the page; `tabindex="-1"` only marks a focus target (the skip link's <main>).
 */
const INTERACTIVE =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"]), [contenteditable], dialog, [role="dialog"], [aria-modal="true"], [data-no-fireworks]'

/**
 * A click there belongs to the season's sky (a firework, a burst of confetti): plain page
 * space, no control under it and no text being selected. `data-no-fireworks` opts an
 * element out.
 */
export function isEmptySpot(target: Element | null, selection: string): boolean {
  if (!target || selection.trim()) return false
  return !target.closest(INTERACTIVE)
}
