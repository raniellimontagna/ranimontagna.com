'use client'

import { usePathname } from '@/shared/config/i18n/navigation'
import { fill } from '../shared/fill'
import { HUNT_SPOTS } from '../shared/hunt'
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
              aria-label={fill(fixed ? copy.bugFixed : copy.bugHidden, {
                n: index + 1,
                total: HUNT_SPOTS.length,
              })}
              onClick={() => find(id)}
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
