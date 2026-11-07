'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'

/**
 * Lights the stage in view and swaps the pinned photo with a curtain. Without
 * motion the first stage stays marked and every stage reads normally.
 */
export function TrajectoryScroller({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return

      const activate = (id: string) => {
        for (const stage of root.querySelectorAll<HTMLElement>('[data-stage]')) {
          stage.dataset.active = String(stage.dataset.stage === id)
        }
        for (const photo of root.querySelectorAll<HTMLElement>('[data-stage-photo]')) {
          const isActive = photo.dataset.stagePhoto === id
          if (isActive && photo.dataset.active !== 'true') {
            gsap.fromTo(
              photo,
              { clipPath: 'inset(100% 0% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out' },
            )
          }
          photo.dataset.active = String(isActive)
        }
      }

      const context = gsap.context(() => {
        for (const stage of root.querySelectorAll<HTMLElement>('[data-stage]')) {
          ScrollTrigger.create({
            trigger: stage,
            start: 'top center',
            end: 'bottom center',
            onToggle: (self: { isActive: boolean }) => {
              if (self.isActive && stage.dataset.stage) activate(stage.dataset.stage)
            },
          })
        }
      }, root)

      revert = () => context.revert()
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return <div ref={rootRef}>{children}</div>
}
