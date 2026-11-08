'use client'

import type { ReactNode } from 'react'
import { openVega } from '@/shared/lib/vega-events'

type VegaTriggerProps = {
  children: ReactNode
  className?: string
}

export function VegaTrigger({ children, className }: VegaTriggerProps) {
  return (
    <button type="button" onClick={openVega} className={className}>
      {children}
    </button>
  )
}
