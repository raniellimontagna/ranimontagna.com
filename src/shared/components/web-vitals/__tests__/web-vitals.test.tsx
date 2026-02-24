import type { Metric } from 'web-vitals'
import { render } from '@/tests/test-utils'
import { WebVitals } from '../web-vitals'

// Mocks
const mockOnCLS = vi.fn()
const mockOnFCP = vi.fn()
const mockOnLCP = vi.fn()
const mockOnTTFB = vi.fn()
const mockOnINP = vi.fn()

vi.mock('web-vitals', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mocking lib
  onCLS: (cb: any) => mockOnCLS(cb),
  // biome-ignore lint/suspicious/noExplicitAny: Mocking lib
  onFCP: (cb: any) => mockOnFCP(cb),
  // biome-ignore lint/suspicious/noExplicitAny: Mocking lib
  onLCP: (cb: any) => mockOnLCP(cb),
  // biome-ignore lint/suspicious/noExplicitAny: Mocking lib
  onTTFB: (cb: any) => mockOnTTFB(cb),
  // biome-ignore lint/suspicious/noExplicitAny: Mocking lib
  onINP: (cb: any) => mockOnINP(cb),
}))

describe('WebVitals Component', () => {
  // Save original window properties
  const originalGtag = window.gtag
  const originalVa = window.va

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window mocks
    window.gtag = vi.fn()
    window.va = vi.fn()
  })

  afterAll(() => {
    window.gtag = originalGtag
    window.va = originalVa
    vi.unstubAllEnvs()
  })

  it('registers all metrics listeners on mount', () => {
    render(<WebVitals />)
    // Check that mocking functions were called (meaning the component called onCLS etc.)
    expect(mockOnCLS).toHaveBeenCalled()
    expect(mockOnFCP).toHaveBeenCalled()
    expect(mockOnLCP).toHaveBeenCalled()
    expect(mockOnTTFB).toHaveBeenCalled()
    expect(mockOnINP).toHaveBeenCalled()
  })

  it('sends metrics to gtag if available', () => {
    render(<WebVitals />)

    // Extract the callback passed to onCLS
    const callback = mockOnCLS.mock.calls[0][0]

    const metric: Metric = {
      name: 'CLS',
      value: 0.1,
      id: 'v1-123',
      rating: 'good',
      delta: 0.1,
      entries: [],
      navigationType: 'navigate',
    }

    callback(metric)

    expect(window.gtag).toHaveBeenCalledWith('event', 'CLS', {
      event_category: 'Web Vitals',
      event_label: 'v1-123',
      value: 100, // 0.1 * 1000
    })
  })

  it('queues and flushes metrics when analytics loads later', () => {
    vi.useFakeTimers()

    window.gtag = undefined as unknown as Window['gtag']
    window.va = undefined

    render(<WebVitals />)

    const callback = mockOnINP.mock.calls[0][0]
    const metric: Metric = {
      name: 'INP',
      value: 120,
      id: 'v4-100',
      rating: 'good',
      delta: 120,
      entries: [],
      navigationType: 'navigate',
    }

    callback(metric)

    const lateGtag = vi.fn()
    window.gtag = lateGtag

    vi.advanceTimersByTime(1000)

    expect(lateGtag).toHaveBeenCalledWith('event', 'INP', {
      event_category: 'Web Vitals',
      event_label: 'v4-100',
      value: 120,
    })

    vi.useRealTimers()
  })

  it('sends metrics to va (Vercel) if available', () => {
    render(<WebVitals />)
    const callback = mockOnFCP.mock.calls[0][0]
    const metric: Metric = {
      name: 'FCP',
      value: 1000,
      id: 'v2-456',
      rating: 'good',
      delta: 1000,
      entries: [],
      navigationType: 'navigate',
    }

    callback(metric)

    expect(window.va).toHaveBeenCalledWith('track', 'Web Vitals', {
      metric: 'FCP',
      value: 1000,
      id: 'v2-456',
    })
  })

  it('logs to console in development', () => {
    // Mock environment
    vi.stubEnv('NODE_ENV', 'development')
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    render(<WebVitals />)
    const callback = mockOnLCP.mock.calls[0][0]
    const metric: Metric = {
      name: 'LCP',
      value: 2000,
      id: 'v3-789',
      rating: 'needs-improvement',
      delta: 2000,
      entries: [],
      navigationType: 'navigate',
    }

    callback(metric)

    expect(consoleSpy).toHaveBeenCalledWith(
      '📊 Web Vitals:',
      expect.objectContaining({
        name: 'LCP',
        value: 2000,
      }),
    )

    consoleSpy.mockRestore()
  })
})
