'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { loadScrollMotion } from '@/shared/components/motion'

/**
 * Lights the stage in view and fades in its company panel (and, below lg, its
 * layer of the sticky strip). This is state, not motion, so it runs with
 * reduced motion too; the panels just switch without a transition. Panels of
 * earlier stages are marked `data-before`, so the strip's logo can leave
 * upwards. Without script the first stage stays marked.
 */
export function TrajectoryScroller({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return

      const order = Array.from(root.querySelectorAll<HTMLElement>('[data-stage]')).map(
        (stage) => stage.dataset.stage,
      )
      const activate = (id: string) => {
        for (const stage of root.querySelectorAll<HTMLElement>('[data-stage]')) {
          stage.dataset.active = String(stage.dataset.stage === id)
        }
        const current = order.indexOf(id)
        for (const panel of root.querySelectorAll<HTMLElement>('[data-stage-panel]')) {
          panel.dataset.active = String(panel.dataset.stagePanel === id)
          panel.dataset.before = String(order.indexOf(panel.dataset.stagePanel) < current)
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
