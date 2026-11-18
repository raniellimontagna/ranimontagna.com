'use client'

import { useState } from 'react'
import { seasonEdition } from '@/shared/lib/seasons/seasons'
import { useSeason } from '@/shared/store/use-season/use-season'
import { midnightOf } from './countdown'
import { FireworksCanvas } from './fireworks-canvas'
import { YearCounter } from './year-counter'
import './reveillon.css'

/** Everything the New Year adds on top of the site. Downloaded only in season. */
export function ReveillonLayer({ locale: _locale }: { locale: string }) {
  const stored = useSeason((state) => state.edition)
  const edition = stored ?? seasonEdition('reveillon', new Date())
  const [turned] = useState(() => Date.now() >= midnightOf(edition).getTime())

  return (
    <>
      <FireworksCanvas />
      <YearCounter edition={edition} turned={turned} />
    </>
  )
}
