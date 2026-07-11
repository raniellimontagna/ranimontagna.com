import { act, render } from '@/tests/test-utils'
import { ProgressiveGsapAnimations } from '../progressive-gsap-animations'

const gsapContext = vi.fn((callback: () => void) => {
  callback()
  return { revert: vi.fn() }
})
const gsapSet = vi.fn()
const gsapFromTo = vi.fn()
const gsapTo = vi.fn()
const gsapQuickTo = vi.fn(() => vi.fn())

vi.mock('gsap', () => ({
  gsap: {
    context: gsapContext,
    set: gsapSet,
    fromTo: gsapFromTo,
    to: gsapTo,
    quickTo: gsapQuickTo,
  },
}))

class InstantIntersectionObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe = (target: Element) => {
    this.callback(
      [{ target, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
  root = null
  rootMargin = ''
  thresholds = []
}

describe('ProgressiveGsapAnimations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.IntersectionObserver =
      InstantIntersectionObserver as unknown as typeof IntersectionObserver
    window.requestIdleCallback = ((callback: IdleRequestCallback) => {
      callback({ didTimeout: false, timeRemaining: () => 50 })
      return 1
    }) as typeof window.requestIdleCallback
    window.cancelIdleCallback = vi.fn()
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  })

  it('loads GSAP after the home sections request and animates marked elements', async () => {
    render(
      <>
        <div data-gsap-reveal="true" data-gsap-direction="up" data-gsap-distance="24">
          Reveal me
        </div>
        <ProgressiveGsapAnimations />
      </>,
    )

    await act(async () => {
      window.dispatchEvent(new Event('home-sections:load'))
      await Promise.resolve()
    })

    expect(gsapContext).toHaveBeenCalled()
    expect(gsapSet).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ autoAlpha: 0, y: 24 }),
    )
    expect(gsapTo).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ autoAlpha: 1, y: 0 }),
    )
  })

  it('does not replay animations for elements that were already bound on later scans', async () => {
    render(
      <>
        <div data-gsap-reveal="true" data-gsap-direction="up">
          Stable reveal
        </div>
        <ProgressiveGsapAnimations />
      </>,
    )

    await act(async () => {
      window.dispatchEvent(new Event('home-sections:load'))
      await Promise.resolve()
    })

    expect(gsapTo).toHaveBeenCalledTimes(1)

    await act(async () => {
      window.dispatchEvent(new Event('home-sections:ready'))
      await Promise.resolve()
    })

    expect(gsapTo).toHaveBeenCalledTimes(1)
  })

  it('does not hide elements that are already visible when GSAP binds them', async () => {
    const { getByText } = render(
      <>
        <div data-gsap-reveal="true" data-gsap-direction="up">
          Already visible
        </div>
        <ProgressiveGsapAnimations />
      </>,
    )
    const element = getByText('Already visible')

    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: 120,
      height: 80,
      left: 16,
      right: 320,
      top: 40,
      width: 304,
      x: 16,
      y: 40,
      toJSON: () => ({}),
    })

    await act(async () => {
      window.dispatchEvent(new Event('home-sections:load'))
      await Promise.resolve()
    })

    expect(gsapFromTo).not.toHaveBeenCalled()
    expect(gsapSet).not.toHaveBeenCalledWith(element, expect.objectContaining({ autoAlpha: 0 }))
  })
})
