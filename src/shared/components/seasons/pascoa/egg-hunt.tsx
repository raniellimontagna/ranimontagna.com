'use client'

import { usePathname } from '@/shared/config/i18n/navigation'
import { fill } from '../shared/fill'
import { HUNT_SPOTS } from '../shared/hunt'
import { HuntSpots } from '../shared/hunt-spots'
import { SoundIcon } from '../shared/sound-icon'
import { SoundToggle } from '../shared/sound-toggle'
import { useHunt } from '../shared/use-hunt'
import { getPascoaCopy } from './pascoa-copy'
import { EggIcon } from './pascoa-icons'
import { playPloc } from './pascoa-sound'

type EggHuntProps = {
  locale: string
  edition: number
  /** The fifth egg was just found. */
  onComplete: () => void
  /** The visitor asks for the chocolate egg again. */
  onReopen: () => void
}

const knock = () => {
  playPloc()
}

/** Five painted eggs hidden in the home sections, in the spots the Christmas gifts use. */
export function EggHunt({ locale, edition, onComplete, onReopen }: EggHuntProps) {
  const copy = getPascoaCopy(locale)
  const { found, find, complete } = useHunt({
    season: 'pascoa',
    edition,
    onFind: knock,
    onComplete,
  })
  const pathname = usePathname()

  return (
    <>
      <HuntSpots
        render={(id, index) => {
          const isFound = found.includes(id)
          return (
            <button
              type="button"
              data-egg={id}
              data-found={isFound || undefined}
              aria-label={fill(isFound ? copy.eggFound : copy.eggHidden, {
                n: index + 1,
                total: HUNT_SPOTS.length,
              })}
              onClick={() => find(id)}
              className="pascoa-egg"
            >
              <EggIcon index={index} found={isFound} />
            </button>
          )
        }}
      />
      {pathname === '/' ? (
        <div className="pascoa-hunt-bar">
          <span className="pascoa-hunt-count">
            <EggIcon index={0} />
            <span>{`${found.length}/${HUNT_SPOTS.length}`}</span>
            <span className="sr-only">{copy.found}</span>
          </span>
          <SoundToggle
            label={copy.sound}
            className="pascoa-hunt-button"
            icon={(on) => <SoundIcon on={on} />}
          />
          {complete ? (
            <button
              type="button"
              aria-label={copy.openEgg}
              onClick={onReopen}
              className="pascoa-hunt-button"
            >
              <EggIcon index={1} found />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
