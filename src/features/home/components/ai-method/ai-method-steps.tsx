'use client'

import { useEffect, useRef } from 'react'
import { loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'
import { SnapCounter } from '@/shared/ui-2026/snap-counter'

type Step = { id: string; title: string; lines: string[] }

/**
 * The method lights up step by step as the list scrolls through the screen.
 * Server HTML ships every step lit, so nothing hides if the script fails or
 * motion is reduced; the client dims them only right before animating.
 * Below lg the list is a swipe carousel (cards of ~80vw) with a counter.
 */
export function AiMethodSteps({ steps, label }: { steps: Step[]; label: string }) {
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list || prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | undefined
    const items = [...list.querySelectorAll<HTMLElement>('[data-ai-step]')]

    loadScrollMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      const light = (count: number) => {
        items.forEach((item, index) => {
          item.dataset.lit = String(index < count)
        })
      }
      light(0)
      const context = gsap.context(() => {
        ScrollTrigger.create({
          trigger: list,
          start: 'top 80%',
          end: 'bottom 45%',
          onUpdate: (self: { progress: number }) => light(Math.ceil(self.progress * items.length)),
          onLeave: () => light(items.length),
        })
      }, list)
      revert = () => {
        context.revert()
        light(items.length)
      }
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <ol
        ref={listRef}
        data-ai-steps
        aria-label={label}
        className="gap-3 lg:grid lg:grid-cols-6 max-lg:-mx-4 max-lg:flex max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-4 max-lg:overflow-x-auto max-lg:px-4 max-lg:pb-2 max-lg:sm:-mx-8 max-lg:sm:scroll-px-8 max-lg:sm:px-8"
      >
        {steps.map((step, index) => (
          <li
            key={step.id}
            data-ai-step={step.id}
            data-lit="true"
            className="group/step flex min-h-[150px] w-[80vw] max-w-[360px] shrink-0 snap-start flex-col lg:w-auto lg:max-w-none gap-2 rounded-[2px] border border-line bg-surface p-4 transition-[border-color,transform] duration-500 data-[lit=true]:border-accent motion-safe:translate-y-2 motion-safe:data-[lit=true]:translate-y-0"
          >
            <span className="font-mono text-xs text-muted transition-colors duration-500 group-data-[lit=true]/step:text-accent">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h4 className="text-base font-semibold text-foreground">{step.title}</h4>
            <div className="flex flex-col font-mono text-xs leading-relaxed text-muted">
              {step.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <SnapCounter targetSelector="[data-ai-steps]" total={steps.length} className="lg:hidden" />
    </div>
  )
}
