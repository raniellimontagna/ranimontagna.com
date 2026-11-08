export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
export const MOBILE_QUERY = '(max-width: 760px)'
export const DESKTOP_QUERY = '(min-width: 761px)'
/** Tailwind's lg: where layouts that change shape on desktop (the live work track) switch. */
export const LG_QUERY = '(min-width: 1024px)'
/** Everything below Tailwind's lg: where the phone motion (stacked chapters, rails, depth) runs. */
export const BELOW_LG_QUERY = '(max-width: 1023px)'

export type ScrollMotion = {
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

let pending: Promise<ScrollMotion> | null = null

/**
 * GSAP and ScrollTrigger stay out of the first paint: components load them here,
 * after mounting. The promise is shared, so the plugin is registered once.
 */
export function loadScrollMotion(): Promise<ScrollMotion> {
  pending ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)
      return { gsap, ScrollTrigger }
    },
  )
  return pending
}
