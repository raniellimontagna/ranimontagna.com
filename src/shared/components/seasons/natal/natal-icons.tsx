/** Hand-drawn Christmas icons in the site's line style; colors come from the season tokens. */

export function GiftIcon({ tone = 'red' }: { tone?: 'red' | 'green' }) {
  const box = tone === 'red' ? 'var(--season-red)' : 'var(--season-green)'
  const ribbon = tone === 'red' ? 'var(--season-gold)' : 'var(--season-red)'
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="natal-gift-icon">
      <g className="natal-gift-lid">
        <path
          d="M16 10c-1.6-3.6-6.4-4.6-6.4-2s4.4 2 6.4 2Zm0 0c1.6-3.6 6.4-4.6 6.4-2s-4.4 2-6.4 2Z"
          fill="none"
          stroke={ribbon}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <rect x="5" y="10" width="22" height="5.5" rx="1.4" fill={box} />
        <rect x="14.4" y="10" width="3.2" height="5.5" fill={ribbon} />
      </g>
      <rect x="7" y="15.5" width="18" height="11.5" rx="1.4" fill={box} />
      <rect x="7" y="15.5" width="18" height="2" fill="rgb(0 0 0 / 18%)" />
      <rect x="14.4" y="15.5" width="3.2" height="11.5" fill={ribbon} />
      <g className="natal-gift-sparkles" fill="var(--season-gold)">
        <path d="M6 4l.9 2.1L9 7l-2.1.9L6 10l-.9-2.1L3 7l2.1-.9Z" />
        <path d="M26 2l.7 1.6 1.6.7-1.6.7L26 6.6l-.7-1.6-1.6-.7 1.6-.7Z" />
        <path d="M28 12l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5Z" />
      </g>
    </svg>
  )
}

export function BellIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
      <path
        d="M12 4a5 5 0 0 0-5 5v3.2L5.4 15.6a.8.8 0 0 0 .7 1.2h11.8a.8.8 0 0 0 .7-1.2L17 12.2V9a5 5 0 0 0-5-5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {on ? null : <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.6" />}
    </svg>
  )
}

export function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
      <circle cx="12" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 19h10l-1.2-3.2H8.2Z" fill="currentColor" />
      <circle cx="10" cy="8" r="0.9" fill="currentColor" />
      <circle cx="14" cy="11" r="0.9" fill="currentColor" />
      <circle cx="11.5" cy="12.5" r="0.7" fill="currentColor" />
    </svg>
  )
}
