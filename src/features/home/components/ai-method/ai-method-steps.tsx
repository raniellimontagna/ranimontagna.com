'use client'

import { Fragment, useEffect, useRef } from 'react'
import {
  BELOW_LG_QUERY,
  LG_QUERY,
  loadScrollMotion,
  prefersReducedMotion,
} from '@/shared/components/motion'
import { buildAiRail } from './ai-rail-motion'

type Step = { id: string; title: string; lines: string[] }

/**
 * The method lights up step by step as the list scrolls through the screen.
 * Server HTML ships every step lit, so nothing hides if the script fails or
 * motion is reduced; the client dims them only right before animating.
 * Below lg a rail draws down the list and lights each step it reaches.
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
      const media = gsap.matchMedia()
      media.add({ lg: LG_QUERY }, () => {
        light(0)
        ScrollTrigger.create({
          trigger: list,
          start: 'top 80%',
          end: 'bottom 45%',
          onUpdate: (self: { progress: number }) => light(Math.ceil(self.progress * items.length)),
          onLeave: () => light(items.length),
        })
        return () => light(items.length)
      })
      media.add({ mobile: BELOW_LG_QUERY }, () => buildAiRail({ gsap, ScrollTrigger }, list))
      revert = () => {
        media.revert()
        light(items.length)
      }
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        data-ai-rail
        className="pointer-events-none absolute top-4 bottom-4 left-[7px] w-0.5 bg-line lg:hidden"
      >
        <span data-ai-rail-fill className="block h-full w-full origin-top bg-accent" />
      </div>
      <ol
        ref={listRef}
        data-ai-steps
        aria-label={label}
        className="relative flex flex-col gap-3 max-lg:pl-8 lg:grid lg:grid-cols-6"
      >
        {steps.map((step, index) => (
          <li
            key={step.id}
            data-ai-step={step.id}
            data-lit="true"
            className="group/step relative flex flex-col gap-2 rounded-[2px] border border-line bg-surface p-4 transition-[border-color,transform] duration-500 data-[lit=true]:border-accent max-lg:transition-[border-color,translate] max-lg:before:absolute max-lg:before:top-4 max-lg:before:-left-[30px] max-lg:before:h-3 max-lg:before:w-3 max-lg:before:rounded-full max-lg:before:border-2 max-lg:before:border-line max-lg:before:bg-background max-lg:before:transition-colors max-lg:data-[lit=true]:before:border-accent max-lg:data-[lit=true]:before:bg-accent lg:min-h-[150px] motion-safe:lg:translate-y-2 motion-safe:lg:data-[lit=true]:translate-y-0 max-lg:motion-safe:translate-x-3 max-lg:motion-safe:data-[lit=true]:translate-x-0"
          >
            <span className="font-mono text-xs text-muted transition-colors duration-500 group-data-[lit=true]/step:text-accent">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h4 className="text-base font-semibold text-foreground transition-opacity duration-500 max-lg:group-data-[lit=false]/step:opacity-[var(--dim-body)]">
              {step.title}
            </h4>
            <div className="flex flex-col font-mono text-xs leading-relaxed text-muted max-lg:flex-row max-lg:flex-wrap">
              {step.lines.map((line, lineIndex) => (
                <Fragment key={line}>
                  {lineIndex > 0 ? (
                    <span aria-hidden="true" className="whitespace-pre lg:hidden">
                      {' · '}
                    </span>
                  ) : null}
                  <span>{line}</span>
                </Fragment>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
