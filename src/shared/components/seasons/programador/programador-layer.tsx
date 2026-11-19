'use client'

import { useCallback, useState } from 'react'
import { seasonEdition } from '@/shared/lib/seasons/seasons'
import { useSeason } from '@/shared/store/use-season/use-season'
import { FooterCountdown } from './footer-countdown'
import { HighlightName } from './highlight-name'
import { LgtmCard } from './lgtm-card'
import { ReviewGame } from './review-game'
import { TokensCanvas } from './tokens-canvas'
import './programador.css'

/** Everything Programmer's Day adds on top of the site. Downloaded only in season. */
export function ProgramadorLayer({ locale }: { locale: string }) {
  const stored = useSeason((state) => state.edition)
  const edition = stored ?? seasonEdition('programador', new Date())
  const [cardOpen, setCardOpen] = useState(false)
  const openCard = useCallback(() => setCardOpen(true), [])
  const closeCard = useCallback(() => setCardOpen(false), [])

  return (
    <>
      <TokensCanvas />
      <HighlightName />
      <FooterCountdown locale={locale} edition={edition} />
      <ReviewGame locale={locale} edition={edition} onComplete={openCard} onReopen={openCard} />
      <LgtmCard open={cardOpen} onClose={closeCard} locale={locale} />
    </>
  )
}
