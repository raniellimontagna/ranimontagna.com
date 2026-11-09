import type { ScrollMotion } from '@/shared/components/motion'

type Layout = 'desktop' | 'mobile'

/**
 * The browser and the phone settle as the stage scrolls in.
 * - desktop: the browser lies back (tilted away, a little smaller) and comes
 *   up flat; the phone rises in front of it.
 * - mobile: no tilt on a small screen; the phone climbs faster than the
 *   browser behind it, so the two read as layers.
 */
export function buildStageRise({ gsap }: ScrollMotion, stage: HTMLElement, layout: Layout) {
  const browser = stage.querySelector<HTMLElement>('[data-stage-browser]')
  const phone = stage.querySelector<HTMLElement>('[data-stage-phone]')
  const scrollTrigger = {
    trigger: stage,
    start: 'top bottom',
    end: layout === 'desktop' ? 'top 15%' : 'bottom 55%',
    // Eases to the scroll position when GSAP arrives instead of snapping; the
    // hero paints the same from-state in CSS (case-hero.tsx), so nothing jumps.
    scrub: 0.8,
  }
  const tweens: Array<{ revert(): void }> = []

  if (browser) {
    tweens.push(
      layout === 'desktop'
        ? gsap.fromTo(
            browser,
            { rotateX: 14, scale: 0.94, transformPerspective: 1600, transformOrigin: '50% 100%' },
            { rotateX: 0, scale: 1, ease: 'none', scrollTrigger },
          )
        : gsap.fromTo(browser, { yPercent: 6 }, { yPercent: -4, ease: 'none', scrollTrigger }),
    )
  }
  if (phone) {
    tweens.push(
      layout === 'desktop'
        ? gsap.fromTo(phone, { yPercent: 28 }, { yPercent: 0, ease: 'none', scrollTrigger })
        : gsap.fromTo(
            phone,
            { yPercent: 22, scale: 0.94 },
            { yPercent: -6, scale: 1, ease: 'none', scrollTrigger },
          ),
    )
  }

  return () => {
    for (const tween of tweens) tween.revert()
  }
}

/**
 * Counts a number up from zero the first time it enters. A number already on
 * screen is left as the server wrote it, so nothing on screen resets.
 */
export function buildCountUp(
  { gsap, ScrollTrigger }: ScrollMotion,
  element: HTMLElement,
  target: number,
  format: (value: number) => string,
) {
  if (element.getBoundingClientRect().top <= window.innerHeight) return () => {}

  const state = { value: 0 }
  element.textContent = format(0)
  const tween = gsap.to(state, {
    value: target,
    duration: 1.6,
    ease: 'expo.out',
    paused: true,
    onUpdate: () => {
      element.textContent = format(Math.round(state.value))
    },
  })
  const trigger = ScrollTrigger.create({
    trigger: element,
    start: 'top 88%',
    once: true,
    onEnter: () => tween.play(),
  })

  return () => {
    trigger.kill()
    tween.kill()
    element.textContent = format(target)
  }
}
