'use client'

import { type ComponentType, type LazyExoticComponent, lazy, Suspense, useEffect } from 'react'
import type { SeasonId } from '@/shared/lib/seasons/seasons'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { useSeason } from '@/shared/store/use-season/use-season'

type LayerProps = { locale: string }

/** Each season's effects, in a chunk of its own: only the season that is on downloads. */
const SEASON_LAYERS: Record<SeasonId, LazyExoticComponent<ComponentType<LayerProps>>> = {
  natal: lazy(() => import('./natal/natal-layer').then((m) => ({ default: m.NatalLayer }))),
  reveillon: lazy(() =>
    import('./reveillon/reveillon-layer').then((m) => ({ default: m.ReveillonLayer })),
  ),
}

/** Loads a season's effects only while it is on, like the retro worlds load. */
export function SeasonLayer({ locale }: LayerProps) {
  const active = useSeason((state) => state.active)
  const init = useSeason((state) => state.init)
  const retro = useRetroMode((state) => state.active)

  useEffect(() => {
    init()
  }, [init])

  if (!active || retro) return null
  const Layer = SEASON_LAYERS[active]

  return (
    <Suspense fallback={null}>
      <Layer locale={locale} />
    </Suspense>
  )
}
