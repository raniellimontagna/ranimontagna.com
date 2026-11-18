const SHELLS = ['--season-lilac', '--season-mint', '--season-pink', '--season-butter'] as const

/** A painted egg; once found it shows a crack and a little star. */
export function EggIcon({ index = 0, found = false }: { index?: number; found?: boolean }) {
  const shell = `var(${SHELLS[index % SHELLS.length]})`
  const band = `var(${SHELLS[(index + 2) % SHELLS.length]})`
  return (
    <svg viewBox="0 0 24 30" aria-hidden="true" className="pascoa-egg-icon">
      <path d="M12 1C6 1 2 11 2 18a10 10 0 0 0 20 0C22 11 18 1 12 1Z" fill={shell} />
      <path d="M2.6 15h18.8v3.4H2.6z" fill={band} />
      <path
        d="M12 1C6 1 2 11 2 18a10 10 0 0 0 20 0C22 11 18 1 12 1Z"
        fill="none"
        stroke="var(--season-chocolate)"
        strokeWidth="1.2"
      />
      {found ? (
        <>
          <path
            d="M3 13l3.5 2.5L9 12l3 3 3-3 2.5 3.5L21 13"
            fill="none"
            stroke="var(--season-chocolate)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M12 4.5l.9 2.4 2.5.2-1.9 1.6.6 2.5L12 9.9l-2.1 1.3.6-2.5-1.9-1.6 2.5-.2z"
            fill="#e2b33c"
          />
        </>
      ) : null}
    </svg>
  )
}
