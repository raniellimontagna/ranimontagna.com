'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import {
  BELOW_LG_QUERY,
  LG_QUERY,
  loadScrollMotion,
  prefersReducedMotion,
} from '@/shared/components/motion'
import { StaticImage } from '@/shared/components/ui/static-image/static-image'
import { ProductArtifact } from './artifacts/product-artifact'
import { SpecArtifact } from './artifacts/spec-artifact'
import { TerminalArtifact } from './artifacts/terminal-artifact'
import { ThreadArtifact } from './artifacts/thread-artifact'
import { type ChapterId, CYCLE_CHAPTERS, type CycleCopy, TERMINAL_LINES } from './cycle.data'
import { buildCycleStack } from './cycle-stack-motion'
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

const shade = (percent: number) => `color-mix(in oklab, var(--background) ${percent}%, transparent)`

// Film grain as a tiny SVG noise tile: it unifies the four scenes and hides
// banding and softness in the dark areas.
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

/**
 * A directional scrim instead of a flat overlay: dark where the text sits
 * (left on desktop, bottom on phones), lighter where the photo's subject is,
 * plus a soft vignette and grain. A flat 75% overlay crushed the photo into a
 * quarter of its tonal range.
 */
function SceneTreatment() {
  return (
    <>
      <div
        aria-hidden="true"
        data-scene-scrim
        className="absolute inset-0 lg:hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, ${shade(55)} 0%, ${shade(68)} 40%, ${shade(92)} 100%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block"
        style={{
          backgroundImage: `linear-gradient(90deg, ${shade(94)} 0%, ${shade(86)} 38%, ${shade(52)} 62%, ${shade(34)} 100%), radial-gradient(ellipse at 72% 50%, transparent 35%, ${shade(55)} 100%)`,
        }}
      />
      <div
        aria-hidden="true"
        data-scene-grain
        className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
    </>
  )
}

/**
 * How he works, in four chapters. From lg up the section pins and the chapters
 * replace each other on a scrubbed timeline. Below lg the chapters are sticky
 * full screens that stack as the page scrolls; with motion, the covered one
 * shrinks and dims and each artifact plays as its chapter settles
 * (cycle-stack-motion.ts).
 */
export function WorkCycle({ copy }: { copy: CycleCopy }) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return

    const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-terminal-line]'))
    const onTerminal = (count: number) => {
      lines.forEach((line, index) => {
        line.hidden = index >= count
      })
    }

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then((motion) => {
      if (cancelled) return

      const media = motion.gsap.matchMedia()
      media.add({ lg: LG_QUERY }, () => {
        root.dataset.pinned = 'true'
        buildCycleTimeline(motion, root, { onTerminal })

        return () => {
          root.dataset.pinned = 'false'
          onTerminal(TERMINAL_LINES.length)
        }
      })
      // Below lg the chapters stack as sticky screens instead (no pin).
      media.add({ mobile: BELOW_LG_QUERY }, () => buildCycleStack(motion, root))
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
      className="group/cycle relative bg-background max-lg:overflow-clip data-[pinned=true]:h-svh data-[pinned=true]:overflow-hidden"
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

      <div
        aria-hidden="true"
        data-stack-bars
        data-follow-header
        className="pointer-events-none sticky top-0 z-30 hidden h-0 group-data-[stacked=true]/cycle:max-lg:block"
      >
        <div className="absolute inset-x-4 top-2 flex gap-2 sm:inset-x-8">
          {CYCLE_CHAPTERS.map((chapter) => (
            <span key={chapter.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
              <span
                data-stack-bar
                className="block h-full w-full origin-left scale-x-0 bg-accent"
              />
            </span>
          ))}
        </div>
      </div>

      {CYCLE_CHAPTERS.map((chapter) => {
        const text = copy.chapters[chapter.id]

        return (
          <article
            key={chapter.id}
            data-scene={chapter.id}
            className="relative flex flex-col overflow-hidden max-lg:sticky max-lg:top-0 max-lg:h-svh lg:min-h-[100svh] group-data-[pinned=true]/cycle:absolute group-data-[pinned=true]/cycle:inset-0 group-data-[pinned=true]/cycle:min-h-0"
          >
            <StaticImage
              data-scene-bg
              src={chapter.background}
              alt=""
              fill
              sizes="100vw"
              quality={90}
              className="object-cover object-[72%_50%] lg:object-center"
            />
            <SceneTreatment />

            <div className="relative z-10 grid flex-1 grid-rows-[auto_1fr] gap-6 px-4 pt-24 pb-8 sm:px-8 lg:grid-cols-2 lg:grid-rows-1 lg:items-center lg:gap-16 lg:px-12 lg:pt-28 lg:pb-16">
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
                    className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline decoration-accent underline-offset-[6px]"
                  >
                    {copy.casesLink}
                  </a>
                ) : null}
              </div>
            </div>
            <div
              aria-hidden="true"
              data-scene-dim
              className="pointer-events-none absolute inset-0 z-20 bg-background opacity-0 lg:hidden"
            />
          </article>
        )
      })}
      {/* The last chapter stays stuck over this, so its bar fills and it can be read. */}
      <div aria-hidden="true" data-stack-spacer className="h-[50svh] lg:hidden" />
    </section>
  )
}
