'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { BELOW_LG_QUERY, loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'

type RevealProps = {
  children: ReactNode
  className?: string
  stagger?: number
}

const TARGETS = '[data-reveal], [data-reveal-word]'

/**
 * Raises `[data-reveal]` and `[data-reveal-word]` descendants into place once,
 * as they enter. Only elements still below the fold are hidden first, so
 * nothing on screen blinks and nothing depends on the script to be visible.
 * Hidden items keep only opacity at 0 (never visibility), so links stay in the
 * tab order, and an item shows at once when focus lands in it.
 *
 * Below lg (read once, at setup), words rise out of their WordReveal mask
 * instead of fading up, and anything inside a `[data-scrub-text]` block is
 * left to ScrubText, which ties it to the scroll there.
 */
export function Reveal({ children, className, stagger = 0.07 }: RevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return

      const context = gsap.context(() => {
        const phone = window.matchMedia(BELOW_LG_QUERY).matches
        const below = Array.from(root.querySelectorAll<HTMLElement>(TARGETS)).filter(
          (element) =>
            element.getBoundingClientRect().top > window.innerHeight &&
            !(phone && element.closest('[data-scrub-text]')),
        )
        if (!below.length) return

        const masked = phone ? below.filter((element) => element.matches('[data-reveal-word]')) : []
        const faded = below.filter((element) => !masked.includes(element))
        if (faded.length) gsap.set(faded, { y: 24, opacity: 0 })
        if (masked.length) gsap.set(masked, { yPercent: 110 })
        ScrollTrigger.batch(below, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) => {
            const rising = batch.filter((element) => masked.includes(element as HTMLElement))
            const fading = batch.filter((element) => !masked.includes(element as HTMLElement))
            if (fading.length)
              gsap.to(fading, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger })
            if (rising.length)
              gsap.to(rising, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger })
          },
        })

        const onFocusIn = (event: FocusEvent) => {
          const item = (event.target as Element | null)?.closest<HTMLElement>(TARGETS)
          if (item && below.includes(item))
            gsap.to(item, { y: 0, yPercent: 0, opacity: 1, duration: 0.3 })
        }
        root.addEventListener('focusin', onFocusIn)
        return () => root.removeEventListener('focusin', onFocusIn)
      }, root)

      revert = () => context.revert()
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [stagger])

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  )
}
