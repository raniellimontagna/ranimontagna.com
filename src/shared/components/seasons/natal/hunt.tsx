'use client'

import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from '@/shared/config/i18n/navigation'
import { track } from '@/shared/lib/analytics/track'
import { GiftButton } from './gift-button'
import { addFound, GIFT_IDS, type GiftId, isComplete, loadFound, saveFound } from './gift-hunt'
import { HuntBar } from './hunt-bar'
import { getNatalCopy } from './natal-copy'
import { playBell } from './season-sound'
import { useSlots } from './use-slots'

type HuntProps = {
  locale: string
  /** The fifth gift was just opened. */
  onComplete: () => void
  /** The visitor asks for the globe again after the hunt. */
  onReopen: () => void
}

const asGift = (value: string | null): GiftId | null =>
  GIFT_IDS.includes(value as GiftId) ? (value as GiftId) : null

/**
 * Five gifts hidden in the home sections. The state lives here, above the pages,
 * so opened gifts stay opened when the visitor navigates away and back.
 */
export function Hunt({ locale, onComplete, onReopen }: HuntProps) {
  const copy = getNatalCopy(locale)
  const year = new Date().getFullYear()
  const [found, setFound] = useState<GiftId[]>(() => loadFound(year))
  const foundRef = useRef(found)
  const slots = useSlots('[data-season-gift]')
  const pathname = usePathname()

  const open = useCallback(
    (id: GiftId) => {
      const previous = foundRef.current
      if (previous.includes(id)) return
      const next = addFound(previous, id)
      foundRef.current = next
      setFound(next)
      saveFound(year, next)
      playBell()
      track('season-gift', { season: 'natal', gift: id, found: next.length })
      if (isComplete(next)) onComplete()
    },
    [year, onComplete],
  )

  return (
    <>
      {slots.map((slot) => {
        const id = asGift(slot.getAttribute('data-season-gift'))
        if (!id) return null
        const opened = found.includes(id)
        return createPortal(
          <GiftButton
            id={id}
            index={GIFT_IDS.indexOf(id)}
            opened={opened}
            label={opened ? copy.giftOpened : copy.giftClosed}
            onOpen={open}
          />,
          slot,
          id,
        )
      })}
      {pathname === '/' ? (
        <HuntBar
          found={found.length}
          complete={isComplete(found)}
          copy={copy}
          onReopen={onReopen}
        />
      ) : null}
    </>
  )
}
