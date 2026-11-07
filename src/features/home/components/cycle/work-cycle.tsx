'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import {
  DESKTOP_QUERY,
  loadScrollMotion,
  MOBILE_QUERY,
  prefersReducedMotion,
} from '@/shared/components/motion'
import { StaticImage } from '@/shared/components/ui/static-image/static-image'
import { ProductArtifact } from './artifacts/product-artifact'
import { SpecArtifact } from './artifacts/spec-artifact'
import { TerminalArtifact } from './artifacts/terminal-artifact'
import { ThreadArtifact } from './artifacts/thread-artifact'
import { type ChapterId, CYCLE_CHAPTERS, type CycleCopy, TERMINAL_LINES } from './cycle.data'
import { buildCycleTimeline } from './cycle-timeline'

function artifactFor(id: ChapterId, copy: CycleCopy): ReactNode {
  switch (id) {
    case 'pain':
      return <ThreadArtifact {...copy.thread} />
    case 'solution':
      return <SpecArtifact {...copy.spec} />
    case 'product':
      return <ProductArtifact {...copy.product} />
    case 'code':
      return <TerminalArtifact lines={TERMINAL_LINES} />
  }
}

/**
 * How he works, in four chapters. Without motion the chapters are stacked
 * blocks; with motion the section pins and the chapters replace each other.
 */
export function WorkCycle({ copy }: { copy: CycleCopy }) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return

    const onTerminal = (count: number) => {
      root.querySelectorAll<HTMLElement>('[data-terminal-line]').forEach((line, index) => {
        line.hidden = index >= count
      })
    }

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then((motion) => {
      if (cancelled) return

      const media = motion.gsap.matchMedia()
      media.add({ desktop: DESKTOP_QUERY, mobile: MOBILE_QUERY }, (context) => {
        root.dataset.pinned = 'true'
        buildCycleTimeline(motion, root, {
          mobile: Boolean(context.conditions?.mobile),
          onTerminal,
        })

        return () => {
          root.dataset.pinned = 'false'
          onTerminal(TERMINAL_LINES.length)
        }
      })
      // Triggers created earlier (the experience pin below) measured the page without
      // this pin's spacer. Re-sort by position and refresh so they start below it.
      motion.ScrollTrigger.sort()
      motion.ScrollTrigger.refresh()
      revert = () => media.revert()
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return (
    <section
      ref={rootRef}
      id="como-trabalho"
      aria-labelledby="work-cycle-heading"
      className="group/cycle relative bg-background data-[pinned=true]:h-svh data-[pinned=true]:overflow-hidden"
    >
      <h2 id="work-cycle-heading" className="sr-only">
        {copy.heading}
      </h2>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 right-4 left-4 z-20 hidden gap-2 group-data-[pinned=true]/cycle:flex sm:right-8 sm:left-8 lg:right-12 lg:left-12"
      >
        {CYCLE_CHAPTERS.map((chapter) => (
          <span key={chapter.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
            <span data-progress-bar className="block h-full w-full bg-accent" />
          </span>
        ))}
      </div>

      {CYCLE_CHAPTERS.map((chapter) => {
        const text = copy.chapters[chapter.id]

        return (
          <article
            key={chapter.id}
            data-scene
            className="relative flex min-h-[90svh] flex-col overflow-hidden group-data-[pinned=true]/cycle:absolute group-data-[pinned=true]/cycle:inset-0 group-data-[pinned=true]/cycle:min-h-0"
          >
            <StaticImage
              data-scene-bg
              src={chapter.background}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-background/75" />

            <div className="relative z-10 grid flex-1 grid-rows-[auto_1fr] gap-8 px-4 pt-32 pb-12 sm:px-8 lg:grid-cols-2 lg:grid-rows-1 lg:items-center lg:gap-16 lg:px-12 lg:pt-28 lg:pb-16">
              <div
                data-scene-art
                className="order-1 w-full max-w-[90vw] justify-self-center lg:order-2 lg:max-w-xl"
              >
                {artifactFor(chapter.id, copy)}
              </div>

              <div data-scene-copy className="order-2 max-w-xl self-end lg:order-1 lg:self-center">
                <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
                  {text.kicker}
                </p>
                <h3 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                  {text.title}
                </h3>
                <p className="mt-4 text-lg leading-snug text-foreground sm:text-xl">{text.body}</p>
                {chapter.id === 'code' ? (
                  <a
                    href="#no-ar"
                    className="mt-6 inline-flex text-sm font-semibold text-foreground underline decoration-accent underline-offset-[6px]"
                  >
                    {copy.casesLink}
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
