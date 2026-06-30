import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface SectionTransitionProps {
  children: ReactNode
  className?: string
}

export function SectionTransition({ children, className }: SectionTransitionProps) {
  return <div className={cn('relative deferred-section', className)}>{children}</div>
}
