'use client'

import { HUNT_SPOTS } from '../shared/hunt'
import { SoundToggle } from '../shared/sound-toggle'
import type { NatalCopy } from './natal-copy'
import { BellIcon, GiftIcon, GlobeIcon } from './natal-icons'

type HuntBarProps = {
  found: number
  complete: boolean
  copy: NatalCopy
  onReopen: () => void
}

/** The hunt's corner: how many gifts so far, the sound switch and, at the end, the globe. */
export function HuntBar({ found, complete, copy, onReopen }: HuntBarProps) {
  return (
    <div className="natal-hunt-bar">
      <span className="natal-hunt-count">
        <GiftIcon />
        <span>{`${found}/${HUNT_SPOTS.length}`}</span>
        <span className="sr-only">{copy.found}</span>
      </span>
      <SoundToggle
        label={copy.sound}
        className="natal-hunt-button"
        icon={(on) => <BellIcon on={on} />}
      />
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
