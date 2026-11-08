'use client'

import { useEffect, useRef } from 'react'
import { loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'

type Step = { id: string; title: string; lines: string[] }

/**
 * The method lights up step by step as the list scrolls through the screen.
 * Server HTML ships every step lit, so nothing hides if the script fails or
 * motion is reduced; the client dims them only right before animating.
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
    <ol ref={listRef} aria-label={label} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {steps.map((step, index) => (
        <li
          key={step.id}
          data-ai-step={step.id}
          data-lit="true"
          className="flex min-h-[150px] flex-col gap-2 rounded-[2px] border border-line bg-surface p-4 opacity-35 transition-[opacity,border-color,transform] duration-500 data-[lit=true]:border-accent data-[lit=true]:opacity-100 motion-safe:translate-y-2 motion-safe:data-[lit=true]:translate-y-0"
        >
          <span className="font-mono text-[10px] text-muted">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h4 className="text-base font-semibold text-foreground">{step.title}</h4>
          <div className="flex flex-col font-mono text-[11px] leading-relaxed text-muted">
            {step.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </li>
      ))}
    </ol>
  )
}
