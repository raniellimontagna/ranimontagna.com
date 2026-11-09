'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { BELOW_LG_QUERY, prefersReducedMotion } from '@/shared/components/motion'

const pad = (value: number) => String(value).padStart(2, '0')

/** Below this share of the screen a caption is too close to the bottom edge to count as read. */
const READABLE_BOTTOM = 0.92

/** Hidden by `display: none` (the desk frame on a phone): its loop must not download. */
const shown = (element: HTMLElement) =>
  element.checkVisibility?.() ?? element.getClientRects().length > 0

/**
 * Drives the product tour from the scroll position, so it is right in both
 * directions and when the tour is entered from below:
 * - desktop: the last step whose top passed the middle of the screen;
 * - phones: the step whose caption shows in the space under the pinned
 *   phone (none showing keeps the current one), so the phone and the text
 *   beside it always match.
 * Every `[data-step]` inside learns it through `data-active` (CSS does the
 * wipe) and inactive screens leave the accessibility tree. Only the active
 * step's loop plays, only while the stage is on screen, never with reduced
 * motion.
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
    let frame = 0

    const syncVideos = () => {
      for (const screen of root.querySelectorAll<HTMLElement>('[data-tour-screen]')) {
        const on = screen.dataset.active === 'true'
        for (const video of screen.querySelectorAll('video')) {
          if (on && stageInView && !still && shown(video)) video.play().catch(() => {})
          else video.pause()
        }
      }
    }

    const activate = (index: number) => {
      active = index
      for (const element of root.querySelectorAll<HTMLElement>('[data-step]')) {
        const on = Number(element.dataset.step) === index
        element.dataset.active = String(on)
        if (element.matches('[data-tour-screen]')) element.setAttribute('aria-hidden', String(!on))
      }
      if (count) count.textContent = `${pad(index + 1)} / ${pad(total)}`
      syncVideos()
    }

    const pick = (): number | null => {
      if (window.matchMedia(BELOW_LG_QUERY).matches) {
        const top = stage?.getBoundingClientRect().bottom ?? 0
        const bottom = window.innerHeight * READABLE_BOTTOM
        const showing = steps.findIndex((step) => {
          const caption = step.querySelector('[data-tour-caption]') ?? step
          const y = caption.getBoundingClientRect().top
          return y >= top && y <= bottom
        })
        return showing === -1 ? null : showing
      }
      const middle = window.innerHeight / 2
      let index = 0
      steps.forEach((step, i) => {
        if (step.getBoundingClientRect().top <= middle) index = i
      })
      return index
    }

    const update = () => {
      frame = 0
      const index = pick()
      if (index !== null && index !== active) activate(index)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    const stageObserver = new IntersectionObserver(([entry]) => {
      stageInView = Boolean(entry?.isIntersecting)
      syncVideos()
    })
    if (stage) stageObserver.observe(stage)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
      stageObserver.disconnect()
    }
  }, [total])

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  )
}
