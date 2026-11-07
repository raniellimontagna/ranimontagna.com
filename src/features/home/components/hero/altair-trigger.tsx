'use client'

import type { ReactNode } from 'react'
import { openAltair } from '@/shared/lib/altair-events'

type AltairTriggerProps = {
  children: ReactNode
  className?: string
}

export function AltairTrigger({ children, className }: AltairTriggerProps) {
  return (
    <button type="button" onClick={openAltair} className={className}>
      {children}
    </button>
  )
}
