'use client'

import { useCallback, useState } from 'react'
import { FooterCountdown } from './footer-countdown'
import { Hunt } from './hunt'
import { NameLights } from './name-lights'
import { SnowCanvas } from './snow-canvas'
import { SnowGlobe } from './snow-globe'

/** Everything Christmas adds on top of the site. Downloaded only in season. */
export function NatalLayer({ locale }: { locale: string }) {
  const [globeOpen, setGlobeOpen] = useState(false)
  const open = useCallback(() => setGlobeOpen(true), [])
  const close = useCallback(() => setGlobeOpen(false), [])

  return (
    <>
      <SnowCanvas />
      <NameLights />
      <FooterCountdown locale={locale} />
      <Hunt locale={locale} onComplete={open} onReopen={open} />
      <SnowGlobe open={globeOpen} onClose={close} locale={locale} />
    </>
  )
}
