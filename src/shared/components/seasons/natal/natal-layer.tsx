'use client'

import { useCallback, useState } from 'react'
import { Hunt } from './hunt'
import { NameLights } from './name-lights'
import { SnowCanvas } from './snow-canvas'

/** Everything Christmas adds on top of the site. Downloaded only in season. */
export function NatalLayer({ locale }: { locale: string }) {
  const [, setGlobeOpen] = useState(false)
  const openGlobe = useCallback(() => setGlobeOpen(true), [])

  return (
    <>
      <SnowCanvas />
      <NameLights />
      <Hunt locale={locale} onComplete={openGlobe} onReopen={openGlobe} />
    </>
  )
}
