export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
export const MOBILE_QUERY = '(max-width: 760px)'
export const DESKTOP_QUERY = '(min-width: 761px)'
/** Tailwind's lg: where layouts that change shape on desktop (the live work track) switch. */
export const LG_QUERY = '(min-width: 1024px)'
/**
 * Everything below Tailwind's lg, written as Tailwind writes max-lg (a range),
 * so fractional widths under zoom (1023.5 px) fall on the phone side too.
 */
export const BELOW_LG_QUERY = '(width < 1024px)'

export type ScrollMotion = {
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

let pending: Promise<ScrollMotion> | null = null

/** Settles in a new macrotask, so the code awaiting it starts a task of its own. */
function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

/**
 * GSAP and ScrollTrigger stay out of the first paint: components load them here,
 * after mounting. The import is shared, so the plugin is registered once.
 *
 * Each caller then resumes in a task of its own, in call order. Some twenty
 * components wait here and each builds its triggers (measuring the page) as
 * soon as this settles. Settling one shared promise ran all of that in a single
 * main-thread task of 230-280 ms on Lighthouse's throttled phone, most of the
 * home page's Total Blocking Time. The work is the same, in short tasks.
 */
export function loadScrollMotion(): Promise<ScrollMotion> {
  pending ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
    async ([{ gsap }, { ScrollTrigger }]) => {
      // Registering measures the viewport: keep it out of the task that evaluated GSAP.
      await nextTask()
      gsap.registerPlugin(ScrollTrigger)
      return { gsap, ScrollTrigger }
    },
  )
  return pending.then(async (motion) => {
    await nextTask()
    return motion
  })
}
