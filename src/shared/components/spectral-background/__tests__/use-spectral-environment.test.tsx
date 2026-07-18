import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { useSpectralEnvironment } from '../use-spectral-environment'

class MutationObserverFake {
  static instances: MutationObserverFake[] = []

  readonly disconnect = vi.fn()
  readonly observe = vi.fn()

  constructor(private readonly callback: MutationCallback) {
    MutationObserverFake.instances.push(this)
  }

  emit(records: MutationRecord[] = []) {
    this.callback(records, this as unknown as MutationObserver)
  }
}

class IntersectionObserverFake {
  static instances: IntersectionObserverFake[] = []

  readonly disconnect = vi.fn()
  readonly observe = vi.fn()
  readonly unobserve = vi.fn()

  constructor(private readonly callback: IntersectionObserverCallback) {
    IntersectionObserverFake.instances.push(this)
  }

  emit(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this as unknown as IntersectionObserver)
  }
}

function Probe({ mode }: { mode: 'desktop' | 'mobile' }) {
  const environment = useSpectralEnvironment(mode)

  return (
    <output data-testid="environment">
      {JSON.stringify({
        zone: environment.zone,
        palette: environment.palette,
        visible: environment.visible,
        pointer: environment.pointerTarget.current,
      })}
    </output>
  )
}

function readEnvironment() {
  return JSON.parse(screen.getByTestId('environment').textContent ?? '{}')
}

function setVisibilityState(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value })
}

function entry(
  target: Element,
  intersectionRatio: number,
  rect: Partial<DOMRectReadOnly> = {},
): IntersectionObserverEntry {
  return {
    boundingClientRect: {
      bottom: 200,
      height: 100,
      left: 400,
      right: 600,
      top: 100,
      width: 200,
      x: 400,
      y: 100,
      toJSON: () => ({}),
      ...rect,
    },
    intersectionRatio,
    intersectionRect: {} as DOMRectReadOnly,
    isIntersecting: intersectionRatio > 0,
    rootBounds: null,
    target,
    time: 0,
  }
}

describe('useSpectralEnvironment', () => {
  beforeEach(() => {
    MutationObserverFake.instances = []
    IntersectionObserverFake.instances = []
    vi.stubGlobal('MutationObserver', MutationObserverFake)
    vi.stubGlobal('IntersectionObserver', IntersectionObserverFake)
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-color-theme')
    document.documentElement.style.setProperty('--accent', '#112233')
    document.documentElement.style.setProperty('--accent-ice', '#445566')
    setVisibilityState('visible')
  })

  afterEach(() => {
    document.documentElement.removeAttribute('style')
    document.body.replaceChildren()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('starts in the quiet zone', () => {
    render(<Probe mode="desktop" />)

    expect(readEnvironment().zone).toBe('quiet')
  })

  it('activates the most-visible zone marker', () => {
    const hero = document.createElement('section')
    hero.dataset.spectralZone = 'hero'
    const focus = document.createElement('section')
    focus.dataset.spectralZone = 'focus'
    document.body.append(hero, focus)

    render(<Probe mode="desktop" />)
    act(() => {
      IntersectionObserverFake.instances[0].emit([entry(hero, 0.3), entry(focus, 0.8)])
    })

    expect(readEnvironment().zone).toBe('focus')
  })

  it('discovers deferred zone markers once and removes their stale candidates', () => {
    render(<Probe mode="desktop" />)
    const intersectionObserver = IntersectionObserverFake.instances[0]
    const zoneMutationObserver = MutationObserverFake.instances[1]
    const hero = document.createElement('section')
    hero.dataset.spectralZone = 'hero'

    document.body.append(hero)
    act(() => {
      zoneMutationObserver.emit([
        {
          addedNodes: document.body.childNodes,
          attributeName: null,
          attributeNamespace: null,
          nextSibling: null,
          oldValue: null,
          previousSibling: null,
          removedNodes: document.createDocumentFragment().childNodes,
          target: document.body,
          type: 'childList',
        },
      ])
    })

    expect(zoneMutationObserver.observe).toHaveBeenCalledWith(document.body, {
      childList: true,
      subtree: true,
    })
    expect(intersectionObserver.observe).toHaveBeenCalledOnce()
    expect(intersectionObserver.observe).toHaveBeenCalledWith(hero)

    act(() => zoneMutationObserver.emit())
    expect(intersectionObserver.observe).toHaveBeenCalledOnce()

    act(() => intersectionObserver.emit([entry(hero, 0.9)]))
    expect(readEnvironment().zone).toBe('hero')

    hero.remove()
    act(() => zoneMutationObserver.emit())

    expect(intersectionObserver.unobserve).toHaveBeenCalledWith(hero)
    expect(readEnvironment().zone).toBe('quiet')
  })

  it('updates the palette after a root theme mutation without remounting', () => {
    render(<Probe mode="desktop" />)
    const initialOutput = screen.getByTestId('environment')

    document.documentElement.classList.add('dark')
    document.documentElement.style.setProperty('--accent', '#ff0000')
    document.documentElement.style.setProperty('--accent-ice', '#00ff00')
    act(() => MutationObserverFake.instances[0].emit())

    expect(screen.getByTestId('environment')).toBe(initialOutput)
    expect(readEnvironment().palette).toEqual({ accent: [1, 0, 0], ice: [0, 1, 0], dark: true })
  })

  it('updates visibility after document visibility changes', () => {
    render(<Probe mode="desktop" />)

    setVisibilityState('hidden')
    fireEvent(document, new Event('visibilitychange'))

    expect(readEnvironment().visible).toBe(false)
  })

  it('keeps quiet visibility and pointer inputs working without MutationObserver', () => {
    const originalMutationObserver = globalThis.MutationObserver
    vi.stubGlobal('MutationObserver', undefined)

    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 })
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 })
      const { unmount } = render(<Probe mode="desktop" />)

      fireEvent.pointerMove(window, { clientX: 750, clientY: 125 })
      setVisibilityState('hidden')
      fireEvent(document, new Event('visibilitychange'))

      expect(readEnvironment()).toMatchObject({
        zone: 'quiet',
        visible: false,
        pointer: { x: 0.5, y: 0.5 },
      })
      unmount()
    } finally {
      vi.stubGlobal('MutationObserver', originalMutationObserver)
    }
  })

  it('maps desktop pointer movement to normalized viewport coordinates', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 })
    const { rerender } = render(<Probe mode="desktop" />)

    fireEvent.pointerMove(window, { clientX: 750, clientY: 125 })
    rerender(<Probe mode="desktop" />)

    expect(readEnvironment().pointer).toEqual({ x: 0.5, y: 0.5 })
  })

  it('does not register pointer tracking for mobile mode', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener')

    render(<Probe mode="mobile" />)

    expect(addEventListener).not.toHaveBeenCalledWith('pointermove', expect.any(Function), {
      passive: true,
    })
  })

  it('disconnects observers and removes listeners on unmount', () => {
    const hero = document.createElement('section')
    hero.dataset.spectralZone = 'hero'
    document.body.append(hero)
    const documentRemoveEventListener = vi.spyOn(document, 'removeEventListener')
    const windowRemoveEventListener = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Probe mode="desktop" />)

    unmount()

    expect(MutationObserverFake.instances[0].disconnect).toHaveBeenCalledOnce()
    expect(MutationObserverFake.instances[1].disconnect).toHaveBeenCalledOnce()
    expect(IntersectionObserverFake.instances[0].disconnect).toHaveBeenCalledOnce()
    expect(documentRemoveEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    )
    expect(windowRemoveEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
  })
})
