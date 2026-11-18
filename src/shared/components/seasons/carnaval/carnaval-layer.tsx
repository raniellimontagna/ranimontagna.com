'use client'

import { seasonEdition } from '@/shared/lib/seasons/seasons'
import { useSeason } from '@/shared/store/use-season/use-season'
import { BlocoGame } from './bloco-game'
import { ConfettiCanvas } from './confetti-canvas'
import { FooterCountdown } from './footer-countdown'
import { NameRhythm } from './name-rhythm'
import './carnaval.css'

/** Everything Carnival adds on top of the site. Downloaded only in season. */
export function CarnavalLayer({ locale }: { locale: string }) {
  const stored = useSeason((state) => state.edition)
  const edition = stored ?? seasonEdition('carnaval', new Date())

  return (
    <>
      <ConfettiCanvas />
      <NameRhythm />
      <FooterCountdown locale={locale} edition={edition} />
      <BlocoGame locale={locale} edition={edition} />
    </>
  )
}
