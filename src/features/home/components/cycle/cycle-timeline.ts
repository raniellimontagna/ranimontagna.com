import type { ScrollMotion } from '@/shared/components/motion'
import { CYCLE_CHAPTERS, TERMINAL_LINES, type Transition, terminalLinesFor } from './cycle.data'

type CycleTimelineOptions = {
  mobile: boolean
  onTerminal: (lines: number) => void
}

const FIRST_CARD = 'inset(18% 22% 18% 22% round 24px)'
const FULL_BLEED = 'inset(0% 0% 0% 0% round 0px)'

/** Where each transition's clip-path starts and ends. */
const CLIPS: Record<Exclude<Transition, 'card'>, [string, string]> = {
  'wipe-up': ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
  circle: ['circle(0% at 70% 50%)', 'circle(150% at 70% 50%)'],
  split: ['inset(0% 50% 0% 50%)', 'inset(0% 0% 0% 0%)'],
}

/**
 * One pinned, scrubbed timeline: the first scene opens from a card, every
 * later scene enters with its own clip-path, the previous copy leaves first,
 * and the terminal types along with the scroll.
 */
export function buildCycleTimeline(
  { gsap }: ScrollMotion,
  root: HTMLElement,
  { mobile, onTerminal }: CycleTimelineOptions,
) {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'))
  const bars = Array.from(root.querySelectorAll<HTMLElement>('[data-progress-bar]'))
  const backgrounds = scenes.map((scene) => scene.querySelector('[data-scene-bg]'))
  const reveals = (scene: HTMLElement) => scene.querySelectorAll('[data-reveal]')
  const outgoing = (scene: HTMLElement) =>
    scene.querySelectorAll('[data-scene-copy], [data-scene-art]')

  gsap.set(scenes.slice(1), { autoAlpha: 0 })
  gsap.set(scenes[0], { clipPath: FIRST_CARD })
  gsap.set(backgrounds.filter(Boolean), { scale: 1.15 })
  gsap.set(bars, { scaleX: 0, transformOrigin: 'left center' })
  onTerminal(0)

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: mobile ? '+=320%' : '+=420%',
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  })

  timeline
    .to(scenes[0], { clipPath: FULL_BLEED, duration: 1, ease: 'power2.inOut' })
    .fromTo(
      reveals(scenes[0]),
      { y: 40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.3, duration: 0.6 },
      '<0.3',
    )
    .to(bars[0] ?? {}, { scaleX: 1, duration: 1.6, ease: 'none' }, 0)

  CYCLE_CHAPTERS.forEach((chapter, index) => {
    if (index === 0 || chapter.transition === 'card') return
    const scene = scenes[index]
    const previous = scenes[index - 1]
    if (!scene || !previous) return
    const [from, to] = CLIPS[chapter.transition]

    timeline
      .to(outgoing(previous), { autoAlpha: 0, y: -30, duration: 0.35 })
      .to(scene, { autoAlpha: 1, duration: 0.01 })
      .fromTo(scene, { clipPath: from }, { clipPath: to, duration: 0.9, ease: 'power3.inOut' }, '<')
      .fromTo(
        reveals(scene),
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.2, duration: 0.5 },
        '<0.3',
      )
      .to(bars[index] ?? {}, { scaleX: 1, duration: 1.4, ease: 'none' }, '<')
  })

  const typing = { progress: 0 }
  timeline.to(typing, {
    progress: 1,
    duration: 1.4,
    ease: 'none',
    onUpdate: () => onTerminal(terminalLinesFor(typing.progress, TERMINAL_LINES.length)),
  })

  const total = timeline.duration()
  for (const background of backgrounds) {
    if (background) timeline.to(background, { scale: 1, duration: total, ease: 'none' }, 0)
  }

  return timeline
}
