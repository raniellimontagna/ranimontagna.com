'use client'

import { useCallback, useEffect, useRef } from 'react'
import { CodePortrait } from '@/features/home/components/portrait/code-portrait'
import type { PortraitImage } from '@/features/home/components/portrait/portrait-image'
import {
  DESKTOP_QUERY,
  loadScrollMotion,
  MOBILE_QUERY,
  prefersReducedMotion,
} from '@/shared/components/motion'

type HeroPortraitProps = {
  image: PortraitImage
  alt: string
}

/** Owns the scroll-driven reveal: scrolling the hero resolves the code into the photo. */
export function HeroPortrait({ image, alt }: HeroPortraitProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reveal = useRef(0)
  const getReveal = useCallback(() => reveal.current, [])

  useEffect(() => {
    const section = rootRef.current?.closest<HTMLElement>('[data-hero-2026]')
    if (!section || prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return

      // matchMedia rebuilds the reveal when a phone rotates across the breakpoint.
      const media = gsap.matchMedia()
      media.add({ desktop: DESKTOP_QUERY, mobile: MOBILE_QUERY }, (context) => {
        const mobile = Boolean(context.conditions?.mobile)
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: mobile ? '+=55%' : 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            reveal.current = self.progress
          },
        })

        const title = section.querySelector('[data-hero-title]')
        if (title) {
          gsap.to(title, {
            yPercent: -18,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
          })
        }
      })

      revert = () => media.revert()
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return (
    <div ref={rootRef} className="h-full w-full">
      <CodePortrait image={image} alt={alt} getReveal={getReveal} />
    </div>
  )
}
