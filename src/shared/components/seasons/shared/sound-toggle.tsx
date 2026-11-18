'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { isSeasonSoundOn, onSeasonSoundChange, setSeasonSound } from './season-sound'

type SoundToggleProps = {
  label: string
  className: string
  /** The season's own picture of the switch, drawn on or off. */
  icon: (on: boolean) => ReactNode
}

/** A season's sound switch: one name, its state in aria-pressed. */
export function SoundToggle({ label, className, icon }: SoundToggleProps) {
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
      {icon(on)}
    </button>
  )
}
