'use client'

import { useCallback, useState } from 'react'
import { seasonEdition } from '@/shared/lib/seasons/seasons'
import { useSeason } from '@/shared/store/use-season/use-season'
import { ArraiaCard } from './arraia-card'
import { Bunting } from './bunting'
import { FooterCountdown } from './footer-countdown'
import { PescariaGame } from './pescaria-game'
import { SparksCanvas } from './sparks-canvas'
import './junina.css'

/** Everything the Festa Junina adds on top of the site. Downloaded only in season. */
export function JuninaLayer({ locale }: { locale: string }) {
  const stored = useSeason((state) => state.edition)
  const edition = stored ?? seasonEdition('junina', new Date())
  const [cardOpen, setCardOpen] = useState(false)
  const openCard = useCallback(() => setCardOpen(true), [])
  const closeCard = useCallback(() => setCardOpen(false), [])

  return (
    <>
      <SparksCanvas />
      <Bunting />
      <FooterCountdown locale={locale} edition={edition} />
      <PescariaGame locale={locale} edition={edition} onComplete={openCard} onReopen={openCard} />
      <ArraiaCard open={cardOpen} onClose={closeCard} locale={locale} />
    </>
  )
}
