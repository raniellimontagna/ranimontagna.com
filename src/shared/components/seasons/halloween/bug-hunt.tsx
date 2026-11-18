'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from '@/shared/config/i18n/navigation'
import { fill } from '../shared/fill'
import { HUNT_SPOTS, type HuntSpot } from '../shared/hunt'
import { HuntSpots } from '../shared/hunt-spots'
import { SoundIcon } from '../shared/sound-icon'
import { SoundToggle } from '../shared/sound-toggle'
import { useHunt } from '../shared/use-hunt'
import { getHalloweenCopy } from './halloween-copy'
import { BugIcon } from './halloween-icons'
import { playSquash } from './halloween-sound'

type BugHuntProps = {
  locale: string
  edition: number
  /** The fifth bug was just squashed. */
  onComplete: () => void
  /** The visitor asks for the report again. */
  onReopen: () => void
}

const crunch = () => {
  playSquash()
}
/** How long a just-squashed bug plays its squash; found bugs stay still after that. */
const SQUASH_MS = 400

/** Five little bugs crawling in the home sections, in the spots the other hunts use. */
export function BugHunt({ locale, edition, onComplete, onReopen }: BugHuntProps) {
  const copy = getHalloweenCopy(locale)
  const { found, find, complete } = useHunt({
    season: 'halloween',
    edition,
    onFind: crunch,
    onComplete,
  })
  const pathname = usePathname()
  const [justFixed, setJustFixed] = useState<HuntSpot | null>(null)
  const settle = useRef(0)

  useEffect(() => () => window.clearTimeout(settle.current), [])

  const squash = (id: HuntSpot) => {
    if (!found.includes(id)) {
      setJustFixed(id)
      window.clearTimeout(settle.current)
      settle.current = window.setTimeout(() => setJustFixed(null), SQUASH_MS)
    }
    find(id)
  }

  return (
    <>
      <HuntSpots
        render={(id, index) => {
          const fixed = found.includes(id)
          return (
            <button
              type="button"
              data-bug={id}
              data-fixed={fixed || undefined}
              data-just-fixed={justFixed === id || undefined}
              aria-label={fill(fixed ? copy.bugFixed : copy.bugHidden, {
                n: index + 1,
                total: HUNT_SPOTS.length,
              })}
              onClick={() => squash(id)}
              className="halloween-bug"
              style={{ animationDelay: `${index * -1.3}s` }}
            >
              <BugIcon fixed={fixed} />
            </button>
          )
        }}
      />
      {pathname === '/' ? (
        <div className="halloween-hunt-bar">
          <span className="halloween-hunt-count">
            <BugIcon />
            <span>{`${found.length}/${HUNT_SPOTS.length}`}</span>
            <span className="sr-only">{copy.fixed}</span>
          </span>
          <SoundToggle
            label={copy.sound}
            className="halloween-hunt-button"
            icon={(on) => <SoundIcon on={on} />}
          />
          {complete ? (
            <button
              type="button"
              aria-label={copy.openCard}
              onClick={onReopen}
              className="halloween-hunt-button"
            >
              <BugIcon fixed />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
