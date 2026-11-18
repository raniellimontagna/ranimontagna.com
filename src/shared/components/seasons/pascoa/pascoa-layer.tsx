'use client'

import { useCallback, useState } from 'react'
import { seasonEdition } from '@/shared/lib/seasons/seasons'
import { useSeason } from '@/shared/store/use-season/use-season'
import { Bunny } from './bunny'
import { EasterCard } from './easter-card'
import { EggHunt } from './egg-hunt'
import { EggPaint } from './egg-paint'
import { FooterCountdown } from './footer-countdown'
import './pascoa.css'

/** Everything Easter adds on top of the site. Downloaded only in season. */
export function PascoaLayer({ locale }: { locale: string }) {
  const stored = useSeason((state) => state.edition)
  const edition = stored ?? seasonEdition('pascoa', new Date())
  const [cardOpen, setCardOpen] = useState(false)
  const openCard = useCallback(() => setCardOpen(true), [])
  const closeCard = useCallback(() => setCardOpen(false), [])

  return (
    <>
      <Bunny />
      <EggPaint />
      <FooterCountdown locale={locale} edition={edition} />
      <EggHunt locale={locale} edition={edition} onComplete={openCard} onReopen={openCard} />
      <EasterCard open={cardOpen} onClose={closeCard} locale={locale} />
    </>
  )
}
