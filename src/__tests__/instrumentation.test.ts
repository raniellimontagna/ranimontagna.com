const sentryMocks = vi.hoisted(() => ({
  captureRequestError: vi.fn(),
  init: vi.fn(),
}))

vi.mock('@sentry/nextjs', () => ({
  captureRequestError: sentryMocks.captureRequestError,
  init: sentryMocks.init,
}))

describe('instrumentation', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('initializes Sentry for the node runtime', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs')
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://public@example.ingest.sentry.io/1')

    const module = await import('@/instrumentation')

    await module.register()

    expect(sentryMocks.init).toHaveBeenCalledWith({
      debug: false,
      dsn: 'https://public@example.ingest.sentry.io/1',
      tracesSampleRate: 1,
    })
    expect(module.onRequestError).toBe(sentryMocks.captureRequestError)
  })

  it('initializes Sentry for the edge runtime', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'edge')
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://public@example.ingest.sentry.io/1')

    const module = await import('@/instrumentation')

    await module.register()

    expect(sentryMocks.init).toHaveBeenCalledWith({
      debug: false,
      dsn: 'https://public@example.ingest.sentry.io/1',
      tracesSampleRate: 1,
    })
  })

  it('does not initialize Sentry for unsupported runtimes', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'browser')

    const module = await import('@/instrumentation')

    await module.register()

    expect(sentryMocks.init).not.toHaveBeenCalled()
    expect(module.onRequestError).toBe(sentryMocks.captureRequestError)
  })
})
