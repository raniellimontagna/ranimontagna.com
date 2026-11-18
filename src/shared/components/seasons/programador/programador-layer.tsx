'use client'

import { seasonEdition } from '@/shared/lib/seasons/seasons'
import { useSeason } from '@/shared/store/use-season/use-season'
import { FooterCountdown } from './footer-countdown'
import { HighlightName } from './highlight-name'
import { TokensCanvas } from './tokens-canvas'
import './programador.css'

/** Everything Programmer's Day adds on top of the site. Downloaded only in season. */
export function ProgramadorLayer({ locale }: { locale: string }) {
  const stored = useSeason((state) => state.edition)
  const edition = stored ?? seasonEdition('programador', new Date())

  return (
    <>
      <TokensCanvas />
      <HighlightName />
      <FooterCountdown locale={locale} edition={edition} />
    </>
  )
}
