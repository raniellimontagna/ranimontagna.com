'use client'

import { useLocale } from 'next-intl'
import type { RetroMode } from '@/shared/store/use-retro-mode/retro-modes'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'

const names = {
  xp: 'Windows XP',
  dos: 'DOS',
  gameboy: 'Game Boy',
  newspaper: 'Gazeta Montagna',
  ide: 'IDE',
  mac: 'Macintosh',
}
const paths = {
  xp: 'M3 3h18v13H3z M8 21h8 M12 16v5 M6 6h12v7H6z',
  dos: 'M3 4h18v16H3z M6 8l3 3-3 3 M12 14h5',
  gameboy: 'M7 2h10v20H7z M9 5h6v7H9z M9 16h4 M11 14v4 M15 16h1',
  newspaper: 'M4 3h16v18H4z M7 6h10 M7 10h4v4H7z M14 10h3 M14 14h3 M7 18h10',
  ide: 'M8 5l-6 7 6 7 M16 5l6 7-6 7 M14 3l-4 18',
  mac: 'M12 6c1-3 3-4 5-4-1 3-3 4-5 4 M12 8c-4-3-9-1-8 5 1 5 3 9 6 8 2-1 2-1 4 0 3 1 5-4 6-7-4-2-4-5-1-7-3-2-5-1-7 1z',
}

export function RetroSecret({ mode }: { mode: Exclude<RetroMode, '1998'> }) {
  const locale = useLocale()
  const setMode = useRetroMode((state) => state.setMode)
  const prefix = locale === 'en' ? 'Enter' : locale === 'es' ? 'Entrar en' : 'Entrar no'
  const label = `${prefix} ${names[mode]}`
  return (
    <button
      type="button"
      className="retro-secret"
      data-retro-secret={mode}
      aria-label={label}
      title={label}
      onClick={() => {
        setMode(mode)
        window.scrollTo({ top: 0, behavior: 'instant' })
      }}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>{names[mode]}</title>
        <path d={paths[mode]} />
      </svg>
    </button>
  )
}
