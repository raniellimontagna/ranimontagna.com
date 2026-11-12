import { captureIntersection, installFrameStub } from '@/tests/mocks/canvas'
import { attachCarouselDepth, nudgeOnce } from '../live-work-depth'

const WIDTH = 300
const GAP = 12
const PADDING = 16

function makeTrack(withImage = [true, true, true]) {
  const track = document.createElement('ul')
  track.style.scrollPaddingLeft = `${PADDING}px`
  track.innerHTML = withImage
    .map(
      (image) =>
        `<li data-live-card>${image ? '<img alt="" />' : '<div data-card-art></div>'}</li>`,
    )
    .join('')
  track.querySelectorAll<HTMLElement>('[data-live-card]').forEach((card, index) => {
    Object.defineProperty(card, 'offsetLeft', { value: PADDING + index * (WIDTH + GAP) })
    Object.defineProperty(card, 'offsetWidth', { value: WIDTH })
  })
  let left = 0
  const reads = { count: 0 }
  Object.defineProperty(track, 'scrollLeft', {
    get: () => {
      reads.count++
      return left
    },
    set: (value: number) => {
      left = value
    },
    configurable: true,
  })
  track.scrollTo = vi.fn() as unknown as typeof track.scrollTo
  document.body.appendChild(track)
  return Object.assign(track, { reads })
}

const card = (track: HTMLElement, index: number) =>
  track.querySelectorAll<HTMLElement>('[data-live-card]')[index]
const image = (track: HTMLElement, index: number) =>
  card(track, index).querySelector('img') as HTMLImageElement

describe('attachCarouselDepth', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('the snapped card is full size, a neighbour is scaled to 0.9 and its image dimmed to 0.5', () => {
    const track = makeTrack()
    attachCarouselDepth(track)
    expect(card(track, 0).style.transform).toBe('scale(1)')
    expect(image(track, 0).style.opacity).toBe('1')
    expect(card(track, 1).style.transform).toBe('scale(0.9)')
    expect(image(track, 1).style.opacity).toBe('0.5')
  })

  it('image counter-slides by -9% per card of distance, zoomed so no edge shows', () => {
    const frames = installFrameStub()
    const track = makeTrack()
    attachCarouselDepth(track)
    expect(image(track, 1).style.transform).toBe('translateX(-9%) scale(1.2)')
    track.scrollLeft = (WIDTH + GAP) / 2
    track.dispatchEvent(new Event('scroll'))
    frames.flush()
    expect(image(track, 1).style.transform).toBe('translateX(-4.5%) scale(1.2)')
    expect(image(track, 0).style.transform).toBe('translateX(4.5%) scale(1.2)')
  })

  it('reads the scroll position once per frame, not once per card', () => {
    const frames = installFrameStub()
    const track = makeTrack()
    attachCarouselDepth(track)
    track.reads.count = 0
    track.scrollLeft = 100
    track.dispatchEvent(new Event('scroll'))
    frames.flush()
    expect(track.reads.count).toBe(1)
  })

  it('a card without a picture only scales', () => {
    const track = makeTrack([true, false, true])
    attachCarouselDepth(track)
    expect(card(track, 1).style.transform).toBe('scale(0.9)')
    expect((card(track, 1).querySelector('[data-card-art]') as HTMLElement).style.opacity).toBe('')
  })

  it('cleanup clears the inline styles and stops listening', () => {
    const frames = installFrameStub()
    const track = makeTrack()
    const cleanup = attachCarouselDepth(track)
    cleanup()
    expect(card(track, 1).style.transform).toBe('')
    expect(image(track, 1).style.transform).toBe('')
    expect(image(track, 1).style.opacity).toBe('')
    track.scrollLeft = 200
    track.dispatchEvent(new Event('scroll'))
    frames.flush()
    expect(card(track, 1).style.transform).toBe('')
  })
})

describe('nudgeOnce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('nudges 70 px and back once, with snap off, then restores snap', () => {
    const io = captureIntersection()
    const track = makeTrack()
    nudgeOnce(track)
    io.setVisible(true)
    expect(track.style.scrollSnapType).toBe('none')
    expect(track.scrollTo).toHaveBeenCalledWith({ left: 70, behavior: 'smooth' })
    vi.advanceTimersByTime(420)
    expect(track.scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' })
    vi.advanceTimersByTime(500)
    expect(track.style.scrollSnapType).toBe('')
    io.setVisible(false)
    io.setVisible(true)
    expect(track.scrollTo).toHaveBeenCalledTimes(2)
  })

  it('does not nudge after the user touched the track', () => {
    const io = captureIntersection()
    const track = makeTrack()
    nudgeOnce(track)
    track.dispatchEvent(new Event('pointerdown'))
    io.setVisible(true)
    expect(track.scrollTo).not.toHaveBeenCalled()
  })

  it('does not nudge a track that was already scrolled', () => {
    const io = captureIntersection()
    const track = makeTrack()
    track.scrollLeft = 120
    nudgeOnce(track)
    io.setVisible(true)
    expect(track.scrollTo).not.toHaveBeenCalled()
  })

  it('a still tap during the nudge sends the track back to the first card', () => {
    const io = captureIntersection()
    const track = makeTrack()
    nudgeOnce(track)
    io.setVisible(true)
    track.scrollLeft = 40
    track.dispatchEvent(new Event('touchstart'))
    track.dispatchEvent(new Event('touchend'))
    expect(track.scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' })
  })

  it('a drag during the nudge is left alone', () => {
    const io = captureIntersection()
    const track = makeTrack()
    nudgeOnce(track)
    io.setVisible(true)
    track.scrollLeft = 40
    track.dispatchEvent(new Event('pointerdown'))
    track.scrollLeft = 260
    track.dispatchEvent(new Event('pointerup'))
    expect(track.scrollTo).toHaveBeenCalledTimes(1)
  })

  it('a touch during the nudge cancels it and restores snap at once', () => {
    const io = captureIntersection()
    const track = makeTrack()
    nudgeOnce(track)
    io.setVisible(true)
    track.dispatchEvent(new Event('touchstart'))
    expect(track.style.scrollSnapType).toBe('')
    vi.advanceTimersByTime(1000)
    expect(track.scrollTo).toHaveBeenCalledTimes(1)
  })
})
