'use client'

import { lazy, Suspense, useEffect } from 'react'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { useSeason } from '@/shared/store/use-season/use-season'

const NatalLayer = lazy(() =>
  import('./natal/natal-layer').then((module) => ({ default: module.NatalLayer })),
)

/** Loads a season's effects only while it is on, like the retro worlds load. */
export function SeasonLayer({ locale }: { locale: string }) {
  const active = useSeason((state) => state.active)
  const init = useSeason((state) => state.init)
  const retro = useRetroMode((state) => state.active)

  useEffect(() => {
    init()
  }, [init])

  if (active !== 'natal' || retro) return null

  return (
    <Suspense fallback={null}>
      <NatalLayer locale={locale} />
    </Suspense>
  )
}
