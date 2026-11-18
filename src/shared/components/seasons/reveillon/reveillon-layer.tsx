'use client'

import { FireworksCanvas } from './fireworks-canvas'
import './reveillon.css'

/** Everything the New Year adds on top of the site. Downloaded only in season. */
export function ReveillonLayer({ locale: _locale }: { locale: string }) {
  return <FireworksCanvas />
}
