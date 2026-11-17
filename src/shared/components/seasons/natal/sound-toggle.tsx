'use client'

import { useEffect, useState } from 'react'
import { BellIcon } from './natal-icons'
import { isSeasonSoundOn, onSeasonSoundChange, setSeasonSound } from './season-sound'

/** The Christmas sound switch: one name, its state in aria-pressed. */
export function SoundToggle({ label, className }: { label: string; className: string }) {
  const [on, setOn] = useState(isSeasonSoundOn)

  useEffect(() => onSeasonSoundChange(setOn), [])

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      onClick={() => setSeasonSound(!on)}
      className={className}
    >
      <BellIcon on={on} />
    </button>
  )
}
