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
  const originalGtag = window.gtag
  const originalVa = window.va

  const metric: Metric = {
    name: 'CLS',
    value: 0.1,
    id: 'v1-123',
    rating: 'good',
    delta: 0.1,
    entries: [],
    navigationType: 'navigate',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    window.gtag = vi.fn()
    window.va = vi.fn()
  })

  afterAll(() => {
    window.gtag = originalGtag
    window.va = originalVa
    vi.unstubAllEnvs()
  })

  it('is inert without both a measurement ID and explicit consent', () => {
    const intervalSpy = vi.spyOn(window, 'setInterval')

    const first = render(<WebVitals measurementId="G-TEST" />)
    first.unmount()
    render(<WebVitals consentGranted />)

    expect(mockOnCLS).not.toHaveBeenCalled()
    expect(mockOnFCP).not.toHaveBeenCalled()
    expect(mockOnLCP).not.toHaveBeenCalled()
    expect(mockOnTTFB).not.toHaveBeenCalled()
    expect(mockOnINP).not.toHaveBeenCalled()
    expect(intervalSpy).not.toHaveBeenCalled()

    intervalSpy.mockRestore()
  })

  it('registers all five metrics only when measurement is enabled', () => {
    render(<WebVitals measurementId="G-TEST" consentGranted />)

    expect(mockOnCLS).toHaveBeenCalled()
    expect(mockOnFCP).toHaveBeenCalled()
    expect(mockOnLCP).toHaveBeenCalled()
    expect(mockOnTTFB).toHaveBeenCalled()
    expect(mockOnINP).toHaveBeenCalled()
  })

  it('sends metrics through the consented gtag provider', () => {
    render(<WebVitals measurementId="G-TEST" consentGranted />)
    const callback = mockOnCLS.mock.calls[0][0]

    callback(metric)

    expect(window.gtag).toHaveBeenCalledWith('event', 'CLS', {
      event_category: 'Web Vitals',
      event_label: 'v1-123',
      send_to: 'G-TEST',
      value: 100,
    })
  })

  it('sends metrics to an existing Vercel provider under the same consent gate', () => {
    render(<WebVitals measurementId="G-TEST" consentGranted />)
    const callback = mockOnFCP.mock.calls[0][0]
    const fcpMetric: Metric = {
      name: 'FCP',
      value: 1000,
      id: 'v2-456',
      rating: 'good',
      delta: 1000,
      entries: [],
      navigationType: 'navigate',
    }

    callback(fcpMetric)

    expect(window.va).toHaveBeenCalledWith('track', 'Web Vitals', {
      metric: 'FCP',
      value: 1000,
      id: 'v2-456',
    })
  })

  it('does not dispatch a stale callback after cleanup', () => {
    const { unmount } = render(<WebVitals measurementId="G-TEST" consentGranted />)
    const callback = mockOnCLS.mock.calls[0][0]

    unmount()
    callback(metric)

    expect(window.gtag).not.toHaveBeenCalled()
    expect(window.va).not.toHaveBeenCalled()
  })

  it('does not poll or emit console noise', () => {
    const intervalSpy = vi.spyOn(window, 'setInterval')
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    render(<WebVitals measurementId="G-TEST" consentGranted />)
    const callback = mockOnLCP.mock.calls[0][0]
    const lcpMetric: Metric = {
      name: 'LCP',
      value: 2000,
      id: 'v3-789',
      rating: 'needs-improvement',
      delta: 2000,
      entries: [],
      navigationType: 'navigate',
    }

    callback(lcpMetric)

    expect(intervalSpy).not.toHaveBeenCalled()
    expect(consoleSpy).not.toHaveBeenCalled()

    intervalSpy.mockRestore()
    consoleSpy.mockRestore()
  })
})
