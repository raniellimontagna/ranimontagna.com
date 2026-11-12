'use client'

import type { ReactNode } from 'react'
import { openVega } from '@/shared/lib/vega-events'

type VegaTriggerProps = {
  children: ReactNode
  className?: string
  /** Marks the page's main Vega button, so the floating launcher steps aside while it shows. */
  cta?: boolean
}

export function VegaTrigger({ children, className, cta }: VegaTriggerProps) {
  return (
    <button type="button" onClick={openVega} className={className} data-vega-cta={cta || undefined}>
      {children}
    </button>
  )
}
