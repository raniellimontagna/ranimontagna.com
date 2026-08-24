import type { Mock } from 'vitest'

const sentryMocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  captureRouterTransitionStart: vi.fn(),
  init: vi.fn(),
  replayIntegration: vi.fn(() => ({ name: 'replay' })),
})) satisfies Record<string, Mock>

vi.mock('@sentry/nextjs', () => ({
  captureException: sentryMocks.captureException,
  captureRouterTransitionStart: sentryMocks.captureRouterTransitionStart,
  init: sentryMocks.init,
  replayIntegration: sentryMocks.replayIntegration,
}))

describe('instrumentation-client', () => {
  const idleCallbacks: IdleRequestCallback[] = []

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    idleCallbacks.length = 0
    window.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      idleCallbacks.push(callback)
      return 1
    })
    window.cancelIdleCallback = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not initialize Sentry when no client DSN is configured', async () => {
    await import('@/instrumentation-client')

    expect(sentryMocks.init).not.toHaveBeenCalled()
    expect(sentryMocks.replayIntegration).not.toHaveBeenCalled()
  })

  it('defers lightweight Sentry client instrumentation until the browser is idle', async () => {
    vi.useFakeTimers()
    window.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      idleCallbacks.push(callback)
      return 1
    })
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://public@example.ingest.sentry.io/1')
    vi.stubEnv('NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE', '0.1')

    const module = await import('@/instrumentation-client')

    expect(sentryMocks.init).not.toHaveBeenCalled()
    expect(sentryMocks.replayIntegration).not.toHaveBeenCalled()
    expect(idleCallbacks).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(2000)
    expect(idleCallbacks).toHaveLength(1)

    await idleCallbacks[0]?.({
      didTimeout: false,
      timeRemaining: () => 50,
    })

    await vi.waitFor(() => {
      expect(sentryMocks.init).toHaveBeenCalledWith({
        debug: false,
        dsn: 'https://public@example.ingest.sentry.io/1',
        tracesSampleRate: 0.1,
      })
    })
    expect(module.onRouterTransitionStart).toEqual(expect.any(Function))
  })

  it('captures a critical browser error before delayed initialization', async () => {
    vi.useFakeTimers()
    window.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      idleCallbacks.push(callback)
      return 1
    })
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://public@example.ingest.sentry.io/1')
    const criticalError = new Error('critical render failure')

    await import('@/instrumentation-client')
    const event = new ErrorEvent('error', { error: criticalError, cancelable: true })
    event.preventDefault()
    window.dispatchEvent(event)

    await vi.waitFor(() => expect(sentryMocks.captureException).toHaveBeenCalledWith(criticalError))
    expect(idleCallbacks).toHaveLength(0)
  })
})
