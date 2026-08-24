import { act, render } from '@/tests/test-utils'
import { ProgressiveGsapAnimations } from '../progressive-gsap-animations'

const gsapContextRevert = vi.fn()
let activeStyleRestorations: Array<() => void> | null = null
const gsapContext = vi.fn((callback: () => void) => {
  const styleRestorations: Array<() => void> = []
  const previousRestorations = activeStyleRestorations
  activeStyleRestorations = styleRestorations
  callback()
  activeStyleRestorations = previousRestorations

  return {
    revert: () => {
      gsapContextRevert()
      for (const restore of styleRestorations.reverse()) restore()
    },
  }
})
const gsapSet = vi.fn(
  (target: Element | NodeListOf<Element>, properties: Record<string, unknown>) => {
    const elements = target instanceof Element ? [target] : Array.from(target)

    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue

      const originalStyle = element.getAttribute('style')
      activeStyleRestorations?.push(() => {
        if (originalStyle === null) element.removeAttribute('style')
        else element.setAttribute('style', originalStyle)
      })

      if (properties.autoAlpha === 0) {
        element.style.opacity = '0'
        element.style.visibility = 'hidden'
      }
      if (typeof properties.y === 'number') {
        element.style.transform = `translateY(${properties.y}px)`
      }
    }
  },
)
const gsapFromTo = vi.fn()
const gsapTo = vi.fn()
const gsapQuickTo = vi.fn(() => vi.fn())
const gsapApi = {
  context: gsapContext,
  set: gsapSet,
  fromTo: gsapFromTo,
  to: gsapTo,
  quickTo: gsapQuickTo,
} as unknown as typeof import('gsap')['gsap']

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
    intersectionObservers.push(this)
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

const intersectionObservers: InstantIntersectionObserver[] = []

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

function createMotionPreference(initialMatches = false) {
  let matches = initialMatches
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const media = '(prefers-reduced-motion: reduce)'
  const mediaQuery = {
    get matches() {
      return matches
    },
    media,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    }),
    removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    }),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList

  return {
    mediaQuery,
    setMatches(nextMatches: boolean) {
      matches = nextMatches
      const event = { matches, media } as MediaQueryListEvent
      for (const listener of listeners) listener(event)
    },
  }
}

describe('ProgressiveGsapAnimations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    intersectionObservers.length = 0
    window.IntersectionObserver =
      InstantIntersectionObserver as unknown as typeof IntersectionObserver
    window.requestIdleCallback = ((callback: IdleRequestCallback) => {
      callback({ didTimeout: false, timeRemaining: () => 50 })
      return 1
    }) as typeof window.requestIdleCallback
    window.cancelIdleCallback = vi.fn()
    window.matchMedia = vi.fn().mockReturnValue(createMotionPreference().mediaQuery)
  })

  it('binds server-rendered sections during idle before the first interaction', async () => {
    const loadGsap = vi.fn().mockResolvedValue(gsapApi)
    const reveal = document.createElement('div')
    reveal.dataset.gsapReveal = 'true'
    document.body.append(reveal)

    const { unmount } = render(<ProgressiveGsapAnimations loadGsap={loadGsap} />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(loadGsap).toHaveBeenCalledTimes(1)
    expect(gsapContext).toHaveBeenCalledTimes(1)

    unmount()
    reveal.remove()
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

  it('disposes animation setup that resolves after the component unmounts', async () => {
    const deferredGsap = createDeferred<typeof gsapApi>()
    const loadGsap = vi.fn(() => deferredGsap.promise)
    const reveal = document.createElement('div')
    reveal.dataset.gsapReveal = 'true'
    document.body.append(reveal)

    const { unmount } = render(<ProgressiveGsapAnimations loadGsap={loadGsap} />)

    await act(async () => {
      window.dispatchEvent(new Event('home-sections:load'))
      await Promise.resolve()
    })

    expect(loadGsap).toHaveBeenCalledTimes(1)
    expect(gsapContext).not.toHaveBeenCalled()

    unmount()

    await act(async () => {
      deferredGsap.resolve(gsapApi)
      await deferredGsap.promise
      await Promise.resolve()
    })

    expect(gsapContext).toHaveBeenCalledTimes(1)
    expect(intersectionObservers).toHaveLength(1)
    expect(intersectionObservers[0]?.disconnect).toHaveBeenCalledTimes(1)
    expect(gsapContextRevert).toHaveBeenCalledTimes(1)

    reveal.remove()
  })

  it('disposes and reinitializes animations when reduced motion changes while mounted', async () => {
    const motionPreference = createMotionPreference()
    window.matchMedia = vi.fn().mockReturnValue(motionPreference.mediaQuery)
    const loadGsap = vi.fn().mockResolvedValue(gsapApi)
    const reveal = document.createElement('div')
    reveal.dataset.gsapReveal = 'true'
    document.body.append(reveal)

    const { unmount } = render(<ProgressiveGsapAnimations loadGsap={loadGsap} />)

    await act(async () => {
      window.dispatchEvent(new Event('home-sections:load'))
      await Promise.resolve()
    })

    expect(gsapContext).toHaveBeenCalledTimes(1)
    expect(intersectionObservers).toHaveLength(1)

    act(() => motionPreference.setMatches(true))

    expect(intersectionObservers[0]?.disconnect).toHaveBeenCalledTimes(1)
    expect(gsapContextRevert).toHaveBeenCalledTimes(1)

    await act(async () => {
      motionPreference.setMatches(false)
      await Promise.resolve()
    })

    expect(loadGsap).toHaveBeenCalledTimes(1)
    expect(gsapContext).toHaveBeenCalledTimes(2)
    expect(intersectionObservers).toHaveLength(2)

    unmount()

    expect(intersectionObservers[1]?.disconnect).toHaveBeenCalledTimes(1)
    expect(gsapContextRevert).toHaveBeenCalledTimes(2)
    expect(motionPreference.mediaQuery.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    )

    reveal.remove()
  })

  it('restores hidden inline styles when reduced motion disposes the animation context', async () => {
    const motionPreference = createMotionPreference()
    window.matchMedia = vi.fn().mockReturnValue(motionPreference.mediaQuery)
    const reveal = document.createElement('div')
    reveal.dataset.gsapReveal = 'true'
    reveal.style.color = 'red'
    document.body.append(reveal)

    const { unmount } = render(
      <ProgressiveGsapAnimations loadGsap={vi.fn().mockResolvedValue(gsapApi)} />,
    )

    await act(async () => {
      window.dispatchEvent(new Event('home-sections:load'))
      await Promise.resolve()
    })

    expect(reveal.style.opacity).toBe('0')
    expect(reveal.style.visibility).toBe('hidden')
    expect(reveal.style.transform).not.toBe('')

    act(() => motionPreference.setMatches(true))

    expect(reveal.style.opacity).toBe('')
    expect(reveal.style.visibility).toBe('')
    expect(reveal.style.transform).toBe('')
    expect(reveal.style.color).toBe('red')

    await act(async () => {
      motionPreference.setMatches(false)
      await Promise.resolve()
    })

    expect(reveal.style.opacity).toBe('0')

    unmount()

    expect(reveal.style.opacity).toBe('')
    expect(reveal.style.visibility).toBe('')
    expect(reveal.style.transform).toBe('')
    expect(reveal.style.color).toBe('red')

    reveal.remove()
  })
})
