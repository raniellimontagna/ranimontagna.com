'use client'

import { useEffect, useState } from 'react'
import { GIFT_IDS } from './gift-hunt'
import type { NatalCopy } from './natal-copy'
import { BellIcon, GiftIcon, GlobeIcon } from './natal-icons'
import { isSeasonSoundOn, onSeasonSoundChange, setSeasonSound } from './season-sound'

type HuntBarProps = {
  found: number
  complete: boolean
  copy: NatalCopy
  onReopen: () => void
}

/** The hunt's corner: how many gifts so far, the sound switch and, at the end, the globe. */
export function HuntBar({ found, complete, copy, onReopen }: HuntBarProps) {
  const [sound, setSound] = useState(isSeasonSoundOn)

  useEffect(() => onSeasonSoundChange(setSound), [])

  return (
    <div className="natal-hunt-bar">
      <span className="natal-hunt-count">
        <GiftIcon />
        <span>{`${found}/${GIFT_IDS.length}`}</span>
        <span className="sr-only">{copy.found}</span>
      </span>
      <button
        type="button"
        aria-pressed={sound}
        aria-label={sound ? copy.soundOn : copy.soundOff}
        onClick={() => setSeasonSound(!sound)}
        className="natal-hunt-button"
      >
        <BellIcon on={sound} />
      </button>
      {complete ? (
        <button
          type="button"
          aria-label={copy.openGlobe}
          onClick={onReopen}
          className="natal-hunt-button"
        >
          <GlobeIcon />
        </button>
      ) : null}
    </div>
  )
}
