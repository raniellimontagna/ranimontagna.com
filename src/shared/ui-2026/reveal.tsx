'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'

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
        const below = Array.from(root.querySelectorAll<HTMLElement>(TARGETS)).filter(
          (element) => element.getBoundingClientRect().top > window.innerHeight,
        )
        if (!below.length) return

        gsap.set(below, { y: 24, autoAlpha: 0 })
        ScrollTrigger.batch(below, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger }),
        })
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
