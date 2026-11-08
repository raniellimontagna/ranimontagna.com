'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import {
  BELOW_LG_QUERY,
  loadScrollMotion,
  prefersReducedMotion,
  type ScrollMotion,
} from '@/shared/components/motion'

type Effect = 'fill' | 'rise'

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const FALLBACK_FLOOR = 0.4
const RISE_SPEED = 1.8
const RISE_STAGGER = 0.05

/**
 * Ties the `[data-reveal-word]` pieces inside `root` to the scroll.
 * - fill: each word goes from the large-text contrast floor (--dim-large) to
 *   full opacity, in order, between the top passing 85% and 50% of the screen.
 * - rise: each letter climbs out of its mask, staggered, as the block enters.
 */
export function buildScrubText(
  ScrollTrigger: ScrollMotion['ScrollTrigger'],
  root: HTMLElement,
  effect: Effect,
) {
  const words = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal-word]'))
  const floor =
    Number.parseFloat(getComputedStyle(root).getPropertyValue('--dim-large')) || FALLBACK_FLOOR

  const update = (progress: number) => {
    words.forEach((word, index) => {
      if (effect === 'fill') {
        word.style.opacity = String(floor + (1 - floor) * clamp(progress * words.length - index))
      } else {
        const climbed = clamp(progress * RISE_SPEED - index * RISE_STAGGER)
        word.style.transform = `translateY(${(1 - climbed) * 100}%)`
      }
    })
  }

  const trigger = ScrollTrigger.create({
    trigger: root,
    start: effect === 'fill' ? 'top 85%' : 'top bottom',
    end: effect === 'fill' ? 'top 50%' : 'top 25%',
    onUpdate: ({ progress }: { progress: number }) => update(progress),
  })
  update(trigger.progress ?? 0)

  return () => {
    trigger.kill()
    for (const word of words) {
      word.style.removeProperty('opacity')
      word.style.removeProperty('transform')
    }
  }
}

/**
 * Below lg, the words (or letters) inside follow the finger instead of
 * appearing once: `Reveal` leaves them alone there. From lg up, and with
 * reduced motion, it renders its children as they are.
 */
export function ScrubText({
  effect,
  children,
  className,
}: {
  effect: Effect
  children: ReactNode
  className?: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      const media = gsap.matchMedia()
      media.add({ mobile: BELOW_LG_QUERY }, () => buildScrubText(ScrollTrigger, root, effect))
      revert = () => media.revert()
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [effect])

  return (
    <div ref={rootRef} data-scrub-text={effect} className={className}>
      {children}
    </div>
  )
}
