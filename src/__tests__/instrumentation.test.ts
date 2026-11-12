import type { Mock } from 'vitest'

const sentryMocks = vi.hoisted(() => ({
  captureRequestError: vi.fn(),
  init: vi.fn(),
})) satisfies Record<string, Mock>

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
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://public@example.ingest.sentry.io/1')
    vi.stubEnv('NEXT_PUBLIC_SENTRY_ENVIRONMENT', 'production')
    vi.stubEnv('NEXT_PUBLIC_SENTRY_RELEASE', 'ranimontagna@1.28.0+202611121430')

    const module = await import('@/instrumentation')

    await module.register()

    expect(sentryMocks.init).toHaveBeenCalledWith({
      debug: false,
      dsn: 'https://public@example.ingest.sentry.io/1',
      environment: 'production',
      release: 'ranimontagna@1.28.0+202611121430',
      tracesSampleRate: 0.1,
    })
    expect(module.onRequestError).toBe(sentryMocks.captureRequestError)
  })

  it('initializes Sentry for the edge runtime', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'edge')
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', '0.25')
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://public@example.ingest.sentry.io/1')
    vi.stubEnv('NEXT_PUBLIC_SENTRY_ENVIRONMENT', 'preview')
    vi.stubEnv('NEXT_PUBLIC_SENTRY_RELEASE', 'ranimontagna@1.28.0+202611121430')

    const module = await import('@/instrumentation')

    await module.register()

    expect(sentryMocks.init).toHaveBeenCalledWith({
      debug: false,
      dsn: 'https://public@example.ingest.sentry.io/1',
      environment: 'preview',
      release: 'ranimontagna@1.28.0+202611121430',
      tracesSampleRate: 0.25,
    })
  })

  it.each(['nodejs', 'edge'])(
    'leaves environment and release unset on %s when the build has none',
    async (runtime) => {
      vi.stubEnv('NEXT_RUNTIME', runtime)
      vi.stubEnv('NEXT_PUBLIC_SENTRY_ENVIRONMENT', '')
      vi.stubEnv('NEXT_PUBLIC_SENTRY_RELEASE', '')

      const module = await import('@/instrumentation')
      await module.register()

      const options = sentryMocks.init.mock.calls[0]?.[0]
      expect(options).toBeDefined()
      expect(options.environment).toBeUndefined()
      expect(options.release).toBeUndefined()
    },
  )

  it('does not initialize Sentry for unsupported runtimes', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'browser')

    const module = await import('@/instrumentation')

    await module.register()

    expect(sentryMocks.init).not.toHaveBeenCalled()
    expect(module.onRequestError).toBe(sentryMocks.captureRequestError)
  })

  it.each([
    ['missing', undefined, 0.1],
    ['malformed', 'not-a-number', 0.1],
    ['negative', '-0.5', 0],
    ['greater than one', '1.8', 1],
  ])('uses a safe production trace rate for %s configuration', async (_label, value, expected) => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs')
    vi.stubEnv('NODE_ENV', 'production')
    if (value === undefined) {
      delete process.env.SENTRY_TRACES_SAMPLE_RATE
    } else {
      vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', value)
    }

    const module = await import('@/instrumentation')
    await module.register()

    expect(sentryMocks.init).toHaveBeenCalledWith(
      expect.objectContaining({ tracesSampleRate: expected }),
    )
    expect(module.onRequestError).toBe(sentryMocks.captureRequestError)
  })

  it('keeps deterministic tracing outside production by default', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs')
    vi.stubEnv('NODE_ENV', 'test')
    delete process.env.SENTRY_TRACES_SAMPLE_RATE

    const module = await import('@/instrumentation')
    await module.register()

    expect(sentryMocks.init).toHaveBeenCalledWith(expect.objectContaining({ tracesSampleRate: 1 }))
  })
})
