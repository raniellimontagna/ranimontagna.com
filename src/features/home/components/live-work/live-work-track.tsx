'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { LG_QUERY, loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'
import { buildLiveTrack } from './live-work-motion'

/** Turns the list into a pinned horizontal track from lg up; smaller screens keep the vertical list. */
export function LiveWorkTrack({ children }: { children: ReactNode }) {
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
      motion.ScrollTrigger.sort?.()
      motion.ScrollTrigger.refresh?.()
      revert = () => media.revert()
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return <div ref={rootRef}>{children}</div>
}
