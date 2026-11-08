const SCALE_DROP = 0.1
const IMAGE_DIM = 0.5
const IMAGE_SLIDE = 9
const IMAGE_ZOOM = 1.2
const NUDGE_DISTANCE = 70
const NUDGE_BACK_AFTER = 420
const NUDGE_SETTLE = 500

/**
 * Below lg: the snapped card stays whole while its neighbours shrink and their
 * pictures dim and slide against the swipe. Card positions are measured once
 * (and on resize) inside the track, so the scroll handler reads no layout.
 * Only the pictures dim: card text keeps full contrast.
 */
export function attachCarouselDepth(track: HTMLElement): () => void {
  const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-live-card]'))
  let centers: number[] = []
  let widths: number[] = []
  let pictures: Array<HTMLElement | null> = []
  let gap = 0
  let padding = 0
  let frame = 0

  const measure = () => {
    widths = cards.map((card) => card.offsetWidth)
    pictures = cards.map((card) => card.querySelector<HTMLElement>('img'))
    centers = cards.map((card, index) => card.offsetLeft + widths[index] / 2)
    gap = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft - widths[0] : 0
    padding = Number.parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0
  }

  const update = () => {
    frame = 0
    // One read, then only writes: reading scrollLeft between writes forces a style recalc per card.
    const left = track.scrollLeft
    cards.forEach((card, index) => {
      const width = widths[index]
      if (!width) return
      const distance = (centers[index] - (left + padding + width / 2)) / (width + gap)
      const away = Math.min(Math.abs(distance), 1)
      card.style.transform = `scale(${1 - SCALE_DROP * away})`
      const picture = pictures[index]
      if (picture) {
        picture.style.transform = `translateX(${-distance * IMAGE_SLIDE}%) scale(${IMAGE_ZOOM})`
        picture.style.opacity = String(1 - IMAGE_DIM * away)
      }
    })
  }

  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(update)
  }
  const onResize = () => {
    measure()
    update()
  }

  measure()
  update()
  track.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)

  return () => {
    window.cancelAnimationFrame(frame)
    frame = 0
    track.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    for (const card of cards) {
      card.style.removeProperty('transform')
      const picture = card.querySelector<HTMLElement>('img')
      picture?.style.removeProperty('transform')
      picture?.style.removeProperty('opacity')
    }
  }
}

const TOUCH_EVENTS = ['pointerdown', 'touchstart', 'wheel'] as const

/**
 * The first time the carousel is mostly on screen, it slides a little and back
 * to show it can be swiped. Never after the person touched it or scrolled it;
 * a touch during the nudge cancels it and gives snapping back at once.
 */
export function nudgeOnce(track: HTMLElement, distance = NUDGE_DISTANCE): () => void {
  let touched = false
  let done = false
  const timers: number[] = []

  const restore = () => track.style.removeProperty('scroll-snap-type')
  const stop = () => {
    for (const id of timers) window.clearTimeout(id)
    timers.length = 0
    restore()
  }
  const onTouch = () => {
    touched = true
    if (timers.length) stop()
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (done || !entries.some((entry) => entry.isIntersecting)) return
      done = true
      observer.disconnect()
      if (touched || track.scrollLeft !== 0) return

      track.style.scrollSnapType = 'none'
      track.scrollTo({ left: distance, behavior: 'smooth' })
      timers.push(
        window.setTimeout(() => {
          track.scrollTo({ left: 0, behavior: 'smooth' })
          timers.push(
            window.setTimeout(() => {
              timers.length = 0
              restore()
            }, NUDGE_SETTLE),
          )
        }, NUDGE_BACK_AFTER),
      )
    },
    { threshold: 0.6 },
  )

  observer.observe(track)
  for (const type of TOUCH_EVENTS) track.addEventListener(type, onTouch, { passive: true })

  return () => {
    observer.disconnect()
    stop()
    for (const type of TOUCH_EVENTS) track.removeEventListener(type, onTouch)
  }
}
