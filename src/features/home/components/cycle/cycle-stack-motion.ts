import type { ScrollMotion } from '@/shared/components/motion'
import type { ChapterId } from './cycle.data'
import { playArtifact, prepareArtifact, resetArtifact } from './cycle-artifact-play'

const COVER_SCALE = 0.1
const COVER_RADIUS = 18
const COVER_DIM = 0.6

/**
 * Below lg: the chapters are sticky full screens that stack. While the next
 * one rises over it, a chapter shrinks, rounds and dims; each background
 * zooms in as its chapter enters; each artifact plays once as its chapter
 * settles. No pin: the page scrolls natively.
 *
 * Every position is measured from the section (chapter i starts i screens
 * down), never from a chapter: a sticky element reports its stuck position,
 * so a refresh while it is stuck would mismeasure it.
 */
export function buildCycleStack({ gsap, ScrollTrigger }: ScrollMotion, root: HTMLElement) {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'))
  const bars = Array.from(root.querySelectorAll<HTMLElement>('[data-stack-bar]'))
  const height = () => scenes[0]?.offsetHeight ?? window.innerHeight
  const at = (index: number, edge: 'top' | 'bottom') => () =>
    index === 0 ? `top ${edge}` : `top+=${index * height()} ${edge}`

  const triggers: Array<{ kill(): void }> = []
  const tweens: Array<{ revert(): void }> = []
  const prepared: Array<[ChapterId, HTMLElement]> = []

  root.dataset.stacked = 'true'

  scenes.forEach((scene, index) => {
    const dim = scene.querySelector<HTMLElement>('[data-scene-dim]')
    const bar = bars[index]

    if (index < scenes.length - 1) {
      triggers.push(
        ScrollTrigger.create({
          id: `cycle-cover-${index}`,
          trigger: root,
          start: at(index + 1, 'bottom'),
          end: at(index + 1, 'top'),
          onUpdate: ({ progress }: { progress: number }) => {
            scene.style.transformOrigin = '50% 0'
            scene.style.transform = `scale(${1 - COVER_SCALE * progress})`
            scene.style.borderRadius = `${COVER_RADIUS * progress}px`
            if (dim) dim.style.opacity = String(COVER_DIM * progress)
            if (bar) bar.style.transform = `scaleX(${progress})`
          },
        }),
      )
    } else if (bar) {
      triggers.push(
        ScrollTrigger.create({
          id: 'cycle-last-bar',
          trigger: root,
          start: at(index, 'top'),
          end: 'bottom bottom',
          onUpdate: ({ progress }: { progress: number }) => {
            bar.style.transform = `scaleX(${progress})`
          },
        }),
      )
    }

    const bg = scene.querySelector<HTMLElement>('[data-scene-bg]')
    if (bg) {
      tweens.push(
        gsap.fromTo(
          bg,
          { scale: 1.12 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: root, start: at(index, 'bottom'), end: at(index, 'top'), scrub: true },
          },
        ),
      )
    }

    const kind = scene.dataset.scene as ChapterId | undefined
    const art = scene.querySelector<HTMLElement>('[data-scene-art]')
    if (kind && art && art.getBoundingClientRect().top > window.innerHeight) {
      prepareArtifact(kind, art, gsap)
      prepared.push([kind, art])
      triggers.push(
        ScrollTrigger.create({
          id: `cycle-play-${index}`,
          trigger: root,
          start: at(index, 'top'),
          once: true,
          onEnter: () => playArtifact(kind, art, gsap),
        }),
      )
    }
  })

  return () => {
    for (const trigger of triggers) trigger.kill()
    for (const tween of tweens) tween.revert()
    for (const [kind, art] of prepared) resetArtifact(kind, art, gsap)
    for (const scene of scenes) {
      scene.style.removeProperty('transform')
      scene.style.removeProperty('transform-origin')
      scene.style.removeProperty('border-radius')
      scene.querySelector<HTMLElement>('[data-scene-dim]')?.style.removeProperty('opacity')
    }
    for (const bar of bars) bar.style.removeProperty('transform')
    delete root.dataset.stacked
  }
}
