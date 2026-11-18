'use client'

import { useCallback, useState } from 'react'
import { seasonEdition } from '@/shared/lib/seasons/seasons'
import { useSeason } from '@/shared/store/use-season/use-season'
import { BatsCanvas } from './bats-canvas'
import { BugHunt } from './bug-hunt'
import { CandleName } from './candle-name'
import { FooterCountdown } from './footer-countdown'
import { ReportCard } from './report-card'
import './halloween.css'

/** Everything Halloween adds on top of the site. Downloaded only in season. */
export function HalloweenLayer({ locale }: { locale: string }) {
  const stored = useSeason((state) => state.edition)
  const edition = stored ?? seasonEdition('halloween', new Date())
  const [cardOpen, setCardOpen] = useState(false)
  const openCard = useCallback(() => setCardOpen(true), [])
  const closeCard = useCallback(() => setCardOpen(false), [])

  return (
    <>
      <BatsCanvas />
      <CandleName />
      <FooterCountdown locale={locale} edition={edition} />
      <BugHunt locale={locale} edition={edition} onComplete={openCard} onReopen={openCard} />
      <ReportCard open={cardOpen} onClose={closeCard} locale={locale} />
    </>
  )
}
