'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { BELOW_LG_QUERY, prefersReducedMotion } from '@/shared/components/motion'

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * The band of the screen where a step counts as read. On desktop it is the
 * middle line; on a phone the pinned phone covers the top, so the step is
 * read as its text comes up into the space below it.
 */
const DESKTOP_BAND = '-50% 0px -50% 0px'
const PHONE_BAND = '-72% 0px -24% 0px'

/**
 * Drives the product tour: the step crossing the band becomes active, and
 * every `[data-step]` inside (the step, its screens in each frame) learns it
 * through `data-active`; CSS does the wipe. Only the active step's loop
 * plays, only while the stage is on screen, and never with reduced motion.
 */
export function CaseTourScroller({
  total,
  children,
  className,
}: {
  total: number
  children: ReactNode
  className?: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const still = prefersReducedMotion()
    const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-tour-step]'))
    const stage = root.querySelector<HTMLElement>('[data-tour-stage]')
    const count = root.querySelector<HTMLElement>('[data-tour-count]')
    let active = 0
    let stageInView = false

    const syncVideos = () => {
      for (const screen of root.querySelectorAll<HTMLElement>('[data-tour-screen]')) {
        const on = screen.dataset.active === 'true'
        for (const video of screen.querySelectorAll('video')) {
          const visible = video.checkVisibility?.() ?? true
          if (on && stageInView && !still && visible) video.play().catch(() => {})
          else video.pause()
        }
      }
    }

    const activate = (index: number) => {
      active = index
      for (const element of root.querySelectorAll<HTMLElement>('[data-step]')) {
        element.dataset.active = String(Number(element.dataset.step) === index)
      }
      if (count) count.textContent = `${pad(index + 1)} / ${pad(total)}`
      syncVideos()
    }

    const stepObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = Number((entry.target as HTMLElement).dataset.step)
          if (index !== active) activate(index)
        }
      },
      { rootMargin: window.matchMedia(BELOW_LG_QUERY).matches ? PHONE_BAND : DESKTOP_BAND },
    )
    for (const step of steps) stepObserver.observe(step)

    const stageObserver = new IntersectionObserver(([entry]) => {
      stageInView = Boolean(entry?.isIntersecting)
      syncVideos()
    })
    if (stage) stageObserver.observe(stage)

    return () => {
      stepObserver.disconnect()
      stageObserver.disconnect()
    }
  }, [total])

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  )
}
