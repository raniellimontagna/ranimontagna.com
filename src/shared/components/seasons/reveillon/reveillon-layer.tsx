'use client'

import './reveillon.css'

/** Everything the New Year adds on top of the site. Downloaded only in season. */
export function ReveillonLayer({ locale }: { locale: string }) {
  return <span hidden data-reveillon-layer={locale} />
}
