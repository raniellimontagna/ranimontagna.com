'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import {
  BELOW_LG_QUERY,
  LG_QUERY,
  loadScrollMotion,
  prefersReducedMotion,
} from '@/shared/components/motion'
import { SnapCounter } from '@/shared/ui-2026/snap-counter'
import { attachCarouselDepth, nudgeOnce } from './live-work-depth'
import { buildLiveTrack } from './live-work-motion'

/**
 * Turns the list into a pinned horizontal track from lg up. Smaller screens
 * swipe it as a snap carousel with depth, a one-time nudge and a counter.
 */
export function LiveWorkTrack({ children, total }: { children: ReactNode; total: number }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const section = root?.closest<HTMLElement>('section')
    const track = root?.querySelector<HTMLElement>('[data-live-track]')
    if (!root || !section || !track || prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then((motion) => {
      if (cancelled) return
      const media = motion.gsap.matchMedia()
      // The track is only horizontal from lg up (Tailwind's lg:flex-row); pinning
      // earlier would pin a vertical list and shrink its cards for nothing.
      media.add({ wide: LG_QUERY }, () => {
        buildLiveTrack(motion, section, track)
      })
      // Below lg the list swipes: depth follows the swipe and it nudges once.
      media.add({ mobile: BELOW_LG_QUERY }, () => {
        const detachDepth = attachCarouselDepth(track)
        const cancelNudge = nudgeOnce(track)
        return () => {
          detachDepth()
          cancelNudge()
        }
      })
      motion.ScrollTrigger.sort?.()
      motion.ScrollTrigger.refresh?.()
      revert = () => media.revert()
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return (
    <div ref={rootRef}>
      {children}
      <SnapCounter
        targetSelector="[data-live-track]"
        total={total}
        className="mt-4 px-4 sm:px-8 lg:hidden"
      />
    </div>
  )
}
