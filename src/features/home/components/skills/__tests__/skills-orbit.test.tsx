import { act, render } from '@/tests/test-utils'
import { SkillsOrbit } from '../skills-orbit'

describe('SkillsOrbit animation lifecycle', () => {
  it('runs only while visible, document-active, and motion is allowed', () => {
    let intersectionCallback: IntersectionObserverCallback | undefined
    const disconnect = vi.fn()
    const mediaListeners = new Set<() => void>()
    let reducedMotion = false

    window.matchMedia = vi.fn().mockImplementation(() => ({
      get matches() {
        return reducedMotion
      },
      addEventListener: (_type: string, listener: () => void) => mediaListeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => mediaListeners.delete(listener),
    }))
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          intersectionCallback = callback
        }
        observe = vi.fn()
        disconnect = disconnect
        unobserve = vi.fn()
        takeRecords = vi.fn()
      },
    )
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })

    const { container, unmount } = render(<SkillsOrbit />)
    const orbit = container.querySelector('[data-skills-orbit]')

    expect(orbit).toHaveAttribute('data-animation-active', 'false')

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    expect(orbit).toHaveAttribute('data-animation-active', 'true')
    expect(container.querySelector('[data-orbit-ring]')).toHaveStyle({
      animationPlayState: 'running',
    })

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(orbit).toHaveAttribute('data-animation-active', 'false')

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
    reducedMotion = true
    act(() => mediaListeners.forEach((listener) => listener()))
    expect(orbit).toHaveAttribute('data-animation-active', 'false')

    unmount()
    expect(disconnect).toHaveBeenCalledOnce()
    expect(mediaListeners).toHaveLength(0)
  })
})
