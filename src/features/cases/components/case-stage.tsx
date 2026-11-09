'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import {
  BELOW_LG_QUERY,
  LG_QUERY,
  loadScrollMotion,
  prefersReducedMotion,
} from '@/shared/components/motion'
import { buildStageRise } from './case-motion'

/**
 * Holds a browser and a phone (`[data-stage-browser]`, `[data-stage-phone]`)
 * and settles them as it scrolls in: tilted to flat on desktop, layered
 * depth on the phone. Both sit in place before the script and without it.
 */
export function CaseStage({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then((motion) => {
      if (cancelled) return
      const media = motion.gsap.matchMedia()
      media.add({ desktop: LG_QUERY, mobile: BELOW_LG_QUERY }, (context) => {
        const { desktop } = context.conditions as { desktop: boolean }
        return buildStageRise(motion, root, desktop ? 'desktop' : 'mobile')
      })
      revert = () => media.revert()
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return (
    <div ref={rootRef} data-case-stage className={className}>
      {children}
    </div>
  )
}
