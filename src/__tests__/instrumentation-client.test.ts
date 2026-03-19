const sentryMocks = vi.hoisted(() => ({
  captureRouterTransitionStart: vi.fn(),
  init: vi.fn(),
  replayIntegration: vi.fn(() => ({ name: 'replay' })),
}))

vi.mock('@sentry/nextjs', () => ({
  captureRouterTransitionStart: sentryMocks.captureRouterTransitionStart,
  init: sentryMocks.init,
  replayIntegration: sentryMocks.replayIntegration,
}))

describe('instrumentation-client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('initializes Sentry client instrumentation with replay support', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://public@example.ingest.sentry.io/1')

    const module = await import('@/instrumentation-client')

    expect(sentryMocks.replayIntegration).toHaveBeenCalledWith({
      blockAllMedia: true,
      maskAllText: true,
    })
    expect(sentryMocks.init).toHaveBeenCalledWith({
      debug: false,
      dsn: 'https://public@example.ingest.sentry.io/1',
      integrations: [{ name: 'replay' }],
      replaysOnErrorSampleRate: 1,
      replaysSessionSampleRate: 0.1,
      tracesSampleRate: 1,
    })
    expect(module.onRouterTransitionStart).toBe(sentryMocks.captureRouterTransitionStart)
  })
})
