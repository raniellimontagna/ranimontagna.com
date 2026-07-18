import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@/tests/test-utils'
import type { SpectralVeilCanvasProps } from '../spectral-background.types'

const { supportsWebGl } = vi.hoisted(() => ({ supportsWebGl: vi.fn() }))

vi.mock('../spectral-background.utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../spectral-background.utils')>()),
  supportsWebGl,
}))

import { SpectralBackground } from '../spectral-background'

type MatchMediaState = {
  coarsePointer: boolean
  reducedMotion: boolean
}

function installMatchMedia(state: MatchMediaState) {
  const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>()

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string): MediaQueryList => {
      const matches = () =>
        query === '(prefers-reduced-motion: reduce)' ? state.reducedMotion : state.coarsePointer
      const queryListeners = listeners.get(query) ?? new Set()
      listeners.set(query, queryListeners)

      const mediaQueryList = {
        get matches() {
          return matches()
        },
        media: query,
        onchange: null,
        addEventListener: (
          _type: string,
          listener: ((event: MediaQueryListEvent) => void) | null,
        ) => {
          if (listener) queryListeners.add(listener)
        },
        removeEventListener: (
          _type: string,
          listener: ((event: MediaQueryListEvent) => void) | null,
        ) => {
          if (listener) queryListeners.delete(listener)
        },
        addListener: (listener: ((event: MediaQueryListEvent) => void) | null) => {
          if (listener) queryListeners.add(listener)
        },
        removeListener: (listener: ((event: MediaQueryListEvent) => void) | null) => {
          if (listener) queryListeners.delete(listener)
        },
        dispatchEvent: () => false,
      }

      return mediaQueryList as unknown as MediaQueryList
    }),
  )

  return {
    set(nextState: Partial<MatchMediaState>) {
      Object.assign(state, nextState)
      for (const [query, queryListeners] of listeners) {
        const event = {
          matches:
            query === '(prefers-reduced-motion: reduce)'
              ? state.reducedMotion
              : state.coarsePointer,
          media: query,
        } as MediaQueryListEvent
        queryListeners.forEach((listener) => {
          listener(event)
        })
      }
    },
  }
}

function createLoader() {
  return vi.fn(async () => ({
    SpectralVeilCanvas: ({ mode, onPermanentFailure }: SpectralVeilCanvasProps) => (
      <canvas data-mode={mode} data-testid="spectral-canvas" onClick={onPermanentFailure} />
    ),
  }))
}

describe('SpectralBackground', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    supportsWebGl.mockReturnValue(true)
    installMatchMedia({ coarsePointer: false, reducedMotion: false })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders a static fallback on the server without invoking the loader', () => {
    const loader = createLoader()

    const html = renderToString(<SpectralBackground canvasLoader={loader} />)

    expect(html).toContain('data-testid="spectral-fallback"')
    expect(loader).not.toHaveBeenCalled()
  })

  it('keeps the fallback and skips loading for reduced motion', async () => {
    installMatchMedia({ coarsePointer: false, reducedMotion: true })
    const loader = createLoader()

    render(<SpectralBackground canvasLoader={loader} />)

    expect(screen.getByTestId('spectral-fallback')).toBeInTheDocument()
    await waitFor(() => expect(loader).not.toHaveBeenCalled())
  })

  it('keeps the fallback and skips loading without WebGL support', async () => {
    supportsWebGl.mockReturnValue(false)
    const loader = createLoader()

    render(<SpectralBackground canvasLoader={loader} />)

    expect(screen.getByTestId('spectral-fallback')).toBeInTheDocument()
    await waitFor(() => expect(loader).not.toHaveBeenCalled())
  })

  it.each([
    ['mobile', { coarsePointer: true, reducedMotion: false }, 1440],
    ['mobile', { coarsePointer: false, reducedMotion: false }, 767],
    ['desktop', { coarsePointer: false, reducedMotion: false }, 1440],
  ] as const)('loads the canvas once in %s mode when capable', async (mode, media, width) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    installMatchMedia(media)
    const loader = createLoader()

    render(<SpectralBackground canvasLoader={loader} />)

    expect(screen.getByTestId('spectral-fallback')).toBeInTheDocument()
    await waitFor(() => expect(loader).toHaveBeenCalledOnce())
    expect(screen.getByTestId('spectral-canvas')).toHaveAttribute('data-mode', mode)
  })

  it('retains the fallback after a rejected import without retrying', async () => {
    const loader = vi.fn(() => Promise.reject(new Error('unavailable')))

    render(<SpectralBackground canvasLoader={loader} />)

    await waitFor(() => expect(loader).toHaveBeenCalledOnce())
    expect(screen.getByTestId('spectral-fallback')).toBeInTheDocument()

    act(() => window.dispatchEvent(new Event('resize')))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(loader).toHaveBeenCalledOnce()
  })

  it('removes the canvas after permanent failure while retaining the fallback', async () => {
    const loader = createLoader()

    render(<SpectralBackground canvasLoader={loader} />)

    await waitFor(() => expect(screen.getByTestId('spectral-canvas')).toBeInTheDocument())
    act(() => screen.getByTestId('spectral-canvas').click())

    expect(screen.getByTestId('spectral-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('spectral-canvas')).not.toBeInTheDocument()
  })
})
