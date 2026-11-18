/** A little spider, the bug; once squashed it turns into a green check. */
export function BugIcon({ fixed = false }: { fixed?: boolean }) {
  if (fixed) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="halloween-bug-icon">
        <circle cx="12" cy="12" r="10" fill="var(--season-slime)" />
        <path
          d="M7 12.5l3.2 3.2L17 9"
          fill="none"
          stroke="var(--background)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="halloween-bug-icon">
      <g stroke="var(--season-bat)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M9 10L4 7M9 12H3M9 14l-5 3M15 10l5-3M15 12h6M15 14l5 3" fill="none" />
      </g>
      <ellipse cx="12" cy="13" rx="4.2" ry="5" fill="var(--season-bat)" />
      <circle cx="12" cy="7.6" r="2.6" fill="var(--season-bat)" />
      <circle cx="11" cy="7.2" r="0.7" fill="var(--season-pumpkin)" />
      <circle cx="13" cy="7.2" r="0.7" fill="var(--season-pumpkin)" />
    </svg>
  )
}

/** A carved pumpkin, for the report card. */
export function PumpkinIcon() {
  return (
    <svg viewBox="0 0 64 56" aria-hidden="true" className="halloween-pumpkin">
      <path d="M30 6c1-4 5-6 8-5-3 2-4 5-4 8Z" fill="var(--season-slime)" />
      <ellipse cx="20" cy="32" rx="16" ry="20" fill="var(--season-pumpkin)" />
      <ellipse cx="44" cy="32" rx="16" ry="20" fill="var(--season-pumpkin)" />
      <ellipse cx="32" cy="32" rx="14" ry="22" fill="var(--season-pumpkin)" />
      <g fill="var(--background)">
        <path d="M18 26l6-6 6 6Z" />
        <path d="M34 26l6-6 6 6Z" />
        <path d="M16 36q16 12 32 0l-5 4-4-3-4 4-4-4-4 4-4-3-4 3Z" />
      </g>
    </svg>
  )
}
