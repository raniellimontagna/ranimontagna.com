'use client'

import { useCallback, useState } from 'react'
import { track } from '@/shared/lib/analytics/track'
import { Hunt } from './hunt'
import { NameLights } from './name-lights'
import { SnowCanvas } from './snow-canvas'
import { SnowGlobe } from './snow-globe'

let huntRecorded = false

/** The finished hunt is counted once a year per visitor, not on every reopening. */
function recordHuntOnce() {
  const key = `season-gifts-done:natal-${new Date().getFullYear()}`
  try {
    if (localStorage.getItem(key) === '1') return
    localStorage.setItem(key, '1')
  } catch {
    if (huntRecorded) return
  }
  huntRecorded = true
  track('season-hunt-complete', { season: 'natal' })
}

/** Everything Christmas adds on top of the site. Downloaded only in season. */
export function NatalLayer({ locale }: { locale: string }) {
  const [globeOpen, setGlobeOpen] = useState(false)
  const complete = useCallback(() => {
    recordHuntOnce()
    setGlobeOpen(true)
  }, [])
  const reopen = useCallback(() => setGlobeOpen(true), [])
  const close = useCallback(() => setGlobeOpen(false), [])

  return (
    <>
      <SnowCanvas />
      <NameLights />
      <Hunt locale={locale} onComplete={complete} onReopen={reopen} />
      <SnowGlobe open={globeOpen} onClose={close} locale={locale} />
    </>
  )
}
