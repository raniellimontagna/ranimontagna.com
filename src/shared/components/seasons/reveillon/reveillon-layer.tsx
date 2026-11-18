'use client'

import { useCallback, useState } from 'react'
import { seasonEdition } from '@/shared/lib/seasons/seasons'
import { useSeason } from '@/shared/store/use-season/use-season'
import { midnightOf } from './countdown'
import { FireworksCanvas } from './fireworks-canvas'
import { FooterCountdown } from './footer-countdown'
import { Virada } from './virada'
import { WavesGame } from './waves-game'
import { WishesCard } from './wishes-card'
import { YearCounter } from './year-counter'
import './reveillon.css'

/** Everything the New Year adds on top of the site. Downloaded only in season. */
export function ReveillonLayer({ locale }: { locale: string }) {
  const stored = useSeason((state) => state.edition)
  const edition = stored ?? seasonEdition('reveillon', new Date())
  const [turned, setTurned] = useState(() => Date.now() >= midnightOf(edition).getTime())
  const turn = useCallback(() => setTurned(true), [])
  const [cardOpen, setCardOpen] = useState(false)
  const openCard = useCallback(() => setCardOpen(true), [])
  const closeCard = useCallback(() => setCardOpen(false), [])

  return (
    <>
      <FireworksCanvas />
      <YearCounter edition={edition} turned={turned} />
      <FooterCountdown locale={locale} edition={edition} />
      <Virada locale={locale} edition={edition} onTurn={turn} />
      <WavesGame locale={locale} edition={edition} onComplete={openCard} onReopen={openCard} />
      <WishesCard open={cardOpen} onClose={closeCard} locale={locale} edition={edition} />
    </>
  )
}
