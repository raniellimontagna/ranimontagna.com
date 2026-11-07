/** Test doubles for canvas-driven components: 2D context, frames and visibility. */

export function mockCanvas2d(size = { width: 400, height: 500 }) {
  let rect = { ...size }
  const ctx = {
    clearRect: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4).fill(200),
    })),
    font: '',
    textBaseline: 'alphabetic',
    fillStyle: '',
    globalAlpha: 1,
  }

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => ctx as unknown as CanvasRenderingContext2D,
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({ ...rect, left: 0, top: 0, right: rect.width, bottom: rect.height, x: 0, y: 0 }) as DOMRect,
  )

  return {
    ctx,
    setSize(width: number, height: number) {
      rect = { width, height }
    },
  }
}

export function installFrameStub() {
  let nextId = 1
  let queue = new Map<number, FrameRequestCallback>()

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const id = nextId++
    queue.set(id, callback)
    return id
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    queue.delete(id)
  })

  return {
    flush(frames = 1) {
      for (let i = 0; i < frames; i++) {
        const current = queue
        queue = new Map()
        for (const callback of current.values()) callback(performance.now())
      }
    },
  }
}

export function captureIntersection() {
  let notify: IntersectionObserverCallback | null = null

  class ControlledIntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds = []
    constructor(callback: IntersectionObserverCallback) {
      notify = callback
    }
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
  }

  window.IntersectionObserver =
    ControlledIntersectionObserver as unknown as typeof IntersectionObserver

  return {
    setVisible(isIntersecting: boolean) {
      notify?.([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
    },
  }
}
