'use client'

import { usePathname } from '@/shared/config/i18n/navigation'
import { fill } from '../shared/fill'
import { HUNT_SPOTS } from '../shared/hunt'
import { HuntSpots } from '../shared/hunt-spots'
import { useHunt } from '../shared/use-hunt'
import { GiftButton } from './gift-button'
import { HuntBar } from './hunt-bar'
import { getNatalCopy } from './natal-copy'
import { playBell } from './natal-sound'

type HuntProps = {
  locale: string
  /** The fifth gift was just opened. */
  onComplete: () => void
  /** The visitor asks for the globe again after the hunt. */
  onReopen: () => void
}

const ring = () => {
  playBell()
}

/** Five gifts hidden in the home sections; opened gifts stay opened across pages. */
export function Hunt({ locale, onComplete, onReopen }: HuntProps) {
  const copy = getNatalCopy(locale)
  const { found, find, complete } = useHunt({
    season: 'natal',
    edition: new Date().getFullYear(),
    onFind: ring,
    onComplete,
  })
  const pathname = usePathname()

  return (
    <>
      <HuntSpots
        render={(id, index) => {
          const opened = found.includes(id)
          return (
            <GiftButton
              id={id}
              index={index}
              opened={opened}
              label={fill(opened ? copy.giftOpened : copy.giftClosed, {
                n: index + 1,
                total: HUNT_SPOTS.length,
              })}
              onOpen={find}
            />
          )
        }}
      />
      {pathname === '/' ? (
        <HuntBar found={found.length} complete={complete} copy={copy} onReopen={onReopen} />
      ) : null}
    </>
  )
}
