/**
 * Opening A of the site menu: the background grows as a circle out of the
 * Menu button, the page behind recedes, the links rise out of their masks one
 * by one, their numbers count up and the socials arrive last. Closing plays it
 * backwards, faster. Web Animations only: no animation library on this path.
 */
export type MenuMotionEls = {
  page: HTMLElement | null
  /** transform-origin for the page recede, measured once when the menu opens. */
  pageOrigin?: string
  bg: HTMLElement
  links: HTMLElement[]
  numbers: HTMLElement[]
  socials: HTMLElement[]
  chrome: HTMLElement[]
}

export type Origin = { x: number; y: number }

export type CloseMotion = { animations: Animation[]; finished: Promise<void> }

const EASE_OUT = 'cubic-bezier(.16,1,.3,1)'
const EASE_IN_OUT = 'cubic-bezier(.83,0,.17,1)'
const EASE_IN = 'cubic-bezier(.7,0,.84,0)'
const CLOSE_SPEED = 0.6
const REDUCED_MS = 150
// vh, not %: a percentage translate is measured on the page, which is
// thousands of pixels tall, and would slide it by hundreds of pixels.
const RECEDED_TRANSFORM = 'translateY(-2vh) scale(.94)'

/**
 * Where the page recedes from: the centre of the viewport, in the page's own
 * coordinates. Measured before the recede starts (a transformed page reports a
 * transformed rect).
 */
export function recedeOrigin(page: HTMLElement): string {
  return `50% ${Math.round(window.innerHeight / 2 - page.getBoundingClientRect().top)}px`
}

function recedeFrames(els: MenuMotionEls): [Keyframe, Keyframe] {
  const transformOrigin = els.pageOrigin ?? '50% 50%'
  return [
    { transform: 'none', opacity: 1, transformOrigin },
    { transform: RECEDED_TRANSFORM, opacity: 0.35, transformOrigin },
  ]
}

export function canAnimate(element: Element | null): element is HTMLElement {
  return Boolean(element) && typeof (element as HTMLElement).animate === 'function'
}

/**
 * A transform on the page re-anchors every fixed child to it, so a section
 * pinned by ScrollTrigger at that moment would jump. The page only recedes
 * when nothing inside it is pinned.
 */
export function recedablePage(): HTMLElement | null {
  const page = document.getElementById('main-content')
  if (!page || page.querySelector('.pin-spacer > [style*="position: fixed"]')) return null
  return page
}

function circle(origin: Origin, radius: number): string {
  return `circle(${radius}px at ${Math.round(origin.x)}px ${Math.round(origin.y)}px)`
}

function farthestCorner(origin: Origin): number {
  const w = window.innerWidth
  const h = window.innerHeight
  return Math.ceil(Math.hypot(Math.max(origin.x, w - origin.x), Math.max(origin.y, h - origin.y)))
}

function countUp(number: HTMLElement, startMs: number) {
  const final = Number(number.textContent)
  if (!Number.isFinite(final) || final < 2) return
  number.textContent = '01'
  for (let step = 2; step <= final; step++) {
    window.setTimeout(
      () => {
        if (number.isConnected) number.textContent = String(step).padStart(2, '0')
      },
      startMs + (step - 1) * 45,
    )
  }
}

/**
 * Entrance animations fill backwards only: their last frame is the element's
 * natural style, so hover transforms keep working once they finish. The page
 * recede is the one state that has to hold while the menu stays open.
 */
export function openMenuMotion(els: MenuMotionEls, origin: Origin, reduced: boolean): Animation[] {
  const run: Animation[] = []
  const fill = 'backwards' as const
  if (reduced) {
    for (const el of [els.bg, ...els.links, ...els.numbers, ...els.socials, ...els.chrome]) {
      run.push(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: REDUCED_MS, fill }))
    }
    return run
  }

  run.push(
    els.bg.animate(
      [{ clipPath: circle(origin, 0) }, { clipPath: circle(origin, farthestCorner(origin)) }],
      { duration: 620, easing: EASE_IN_OUT, fill },
    ),
  )
  if (els.page) {
    run.push(
      els.page.animate(recedeFrames(els), { duration: 620, easing: EASE_IN_OUT, fill: 'both' }),
    )
  }
  for (const el of els.chrome) {
    run.push(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 300, fill }))
  }
  els.links.forEach((link, index) => {
    run.push(
      link.animate([{ transform: 'translateY(110%)' }, { transform: 'none' }], {
        duration: 520,
        delay: 240 + index * 55,
        easing: EASE_OUT,
        fill,
      }),
    )
  })
  els.numbers.forEach((number, index) => {
    const delay = 300 + index * 55
    countUp(number, delay)
    run.push(number.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay, fill }))
  })
  els.socials.forEach((social, index) => {
    run.push(
      social.animate(
        [
          { transform: 'translateY(14px)', opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        {
          duration: 320,
          delay: 560 + index * 40,
          easing: EASE_OUT,
          fill,
        },
      ),
    )
  })
  return run
}

/**
 * The same choreography backwards at 0.6 of the time: the content fades out,
 * then the circle shrinks back into the button while the page comes forward.
 * Reversing the returned animations brings the menu back to open.
 */
export function closeMenuMotion(els: MenuMotionEls, origin: Origin, reduced: boolean): CloseMotion {
  const run: Animation[] = []
  const fill = 'both' as const
  const content = [...els.socials, ...els.links, ...els.numbers, ...els.chrome]
  if (reduced) {
    for (const el of [els.bg, ...content]) {
      run.push(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: REDUCED_MS, fill }))
    }
  } else {
    const speed = (ms: number) => ms * CLOSE_SPEED
    content.forEach((el, index) => {
      run.push(
        el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: speed(240),
          delay: speed(Math.min(index, 6) * 30),
          easing: EASE_IN,
          fill,
        }),
      )
    })
    const timing = { duration: speed(620), delay: speed(160), easing: EASE_IN_OUT, fill }
    run.push(
      els.bg.animate(
        [{ clipPath: circle(origin, farthestCorner(origin)) }, { clipPath: circle(origin, 0) }],
        timing,
      ),
    )
    if (els.page) run.push(els.page.animate([...recedeFrames(els)].reverse(), timing))
  }
  const finished = Promise.all(
    run.map((animation) => animation.finished.catch(() => undefined)),
  ).then(() => undefined)
  return { animations: run, finished }
}
