'use client'

import { useCallback, useRef, useState } from 'react'
import { track } from '@/shared/lib/analytics/track'
import type { SeasonId } from '@/shared/lib/seasons/seasons'
import { addFound, type HuntSpot, isComplete, loadFound, saveFound } from './hunt'

type UseHunt = {
  season: SeasonId
  edition: number
  /** Something was just found (a sound, an animation). */
  onFind?: (found: HuntSpot[]) => void
  /** The fifth thing was just found. */
  onComplete: () => void
}

/**
 * A season's hunt across the five home spots. The state lives above the pages, so found
 * things stay found when the visitor navigates away and back; it is saved per edition.
 */
export function useHunt({ season, edition, onFind, onComplete }: UseHunt) {
  const [found, setFound] = useState<HuntSpot[]>(() => loadFound(season, edition))
  const foundRef = useRef(found)

  const find = useCallback(
    (id: HuntSpot) => {
      const previous = foundRef.current
      if (previous.includes(id)) return
      const next = addFound(previous, id)
      foundRef.current = next
      setFound(next)
      saveFound(season, edition, next)
      onFind?.(next)
      track('season-gift', { season, gift: id, found: next.length })
      if (isComplete(next)) onComplete()
    },
    [season, edition, onFind, onComplete],
  )

  return { found, find, complete: isComplete(found) }
}
