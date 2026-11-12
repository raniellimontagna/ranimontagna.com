/**
 * A 2 px accent line at the top that fills with the document scroll. CSS only
 * (animation-timeline: scroll(), see globals.css): where it is unsupported or
 * motion is reduced, the line stays at zero width. It sits above the content
 * and under the header, so it shows while the header is tucked away.
 */
export function ScrollProgress() {
  return (
    <div
      data-scroll-progress
      aria-hidden="true"
      className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-30 h-0.5 origin-left scale-x-0 bg-accent"
    />
  )
}
