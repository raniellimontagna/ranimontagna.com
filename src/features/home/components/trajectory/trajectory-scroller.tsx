'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'

/**
 * Lights the stage in view and fades in its company panel. Without motion the
 * first stage stays marked and every stage reads normally.
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
        for (const panel of root.querySelectorAll<HTMLElement>('[data-stage-panel]')) {
          panel.dataset.active = String(panel.dataset.stagePanel === id)
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
