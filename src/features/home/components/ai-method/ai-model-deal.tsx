'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { BELOW_LG_QUERY, loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'

/**
 * Below lg the model tiles are dealt in like cards, once, as the grid enters.
 * Only when the grid starts below the fold, so nothing on screen blinks.
 */
export function ModelDeal({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      const media = gsap.matchMedia()
      media.add({ mobile: BELOW_LG_QUERY }, () => {
        const tiles = root.querySelectorAll<HTMLElement>('[data-ai-models] > li')
        if (!tiles.length || root.getBoundingClientRect().top <= window.innerHeight) return

        gsap.set(tiles, {
          rotationX: -75,
          y: 16,
          opacity: 0,
          transformPerspective: 600,
          transformOrigin: '50% 100%',
        })
        ScrollTrigger.create({
          trigger: root,
          start: 'top 85%',
          once: true,
          onEnter: () =>
            gsap.to(tiles, {
              rotationX: 0,
              y: 0,
              opacity: 1,
              stagger: 0.07,
              duration: 0.6,
              ease: 'expo.out',
            }),
        })
      })
      revert = () => media.revert()
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return <div ref={rootRef}>{children}</div>
}
