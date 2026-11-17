'use client'

import { NameLights } from './name-lights'
import { SnowCanvas } from './snow-canvas'

/** Everything Christmas adds on top of the site. Downloaded only in season. */
export function NatalLayer(_props: { locale: string }) {
  return (
    <>
      <SnowCanvas />
      <NameLights />
    </>
  )
}
