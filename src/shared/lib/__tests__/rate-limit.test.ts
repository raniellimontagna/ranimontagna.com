import {
  checkRateLimit,
  getRateLimitIdentifier,
  resetRateLimitStateForTests,
} from '@/shared/lib/rate-limit'

const options = (identifier: string) => ({
  identifier,
  keyPrefix: 'test:rate-limit',
  max: 1,
  windowMs: 60_000,
})

describe('shared rate limit boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-23T12:00:00.000Z'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    resetRateLimitStateForTests()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
    vi.restoreAllMocks()
    resetRateLimitStateForTests()
  })

  it('ignores spoofable forwarding headers outside a trusted platform', () => {
    const identifier = getRateLimitIdentifier(
      new Headers({
        'cf-connecting-ip': '198.51.100.1',
        'x-forwarded-for': '198.51.100.2',
        'x-real-ip': '198.51.100.3',
        'true-client-ip': '198.51.100.4',
        'user-agent': 'vitest',
      }),
    )

    expect(identifier).toMatch(/^anon:/)
    expect(identifier).not.toContain('198.51.100')
  })

  it('trusts only the forwarding header associated with the active platform', () => {
    const headers = new Headers({
      'cf-connecting-ip': '198.51.100.10',
      'x-forwarded-for': '198.51.100.20, 10.0.0.1',
    })

    vi.stubEnv('VERCEL', '1')
    expect(getRateLimitIdentifier(headers)).toBe('ip:198.51.100.20')

    vi.stubEnv('VERCEL', '')
    vi.stubEnv('CF_PAGES', '1')
    expect(getRateLimitIdentifier(headers)).toBe('ip:198.51.100.10')
  })

  it('evicts the oldest live entry when the memory store reaches its hard cap', async () => {
    vi.stubEnv('RATE_LIMIT_MEMORY_MAX_ENTRIES', '2')

    await checkRateLimit(options('first'))
    await checkRateLimit(options('second'))
    await checkRateLimit(options('third'))

    const firstAfterEviction = await checkRateLimit(options('first'))
    const thirdStillPresent = await checkRateLimit(options('third'))

    expect(firstAfterEviction.allowed).toBe(true)
    expect(thirdStillPresent.allowed).toBe(false)
  })

  it('releases an entry at resetAt and after the boundary', async () => {
    const first = await checkRateLimit(options('boundary'))

    vi.setSystemTime(first.resetAt)
    const atBoundary = await checkRateLimit(options('boundary'))

    vi.setSystemTime(atBoundary.resetAt + 1)
    const afterBoundary = await checkRateLimit(options('boundary'))

    expect(atBoundary.allowed).toBe(true)
    expect(afterBoundary.allowed).toBe(true)
  })

  it('limits expiry cleanup to the configured batch while preserving deterministic eviction', async () => {
    vi.stubEnv('RATE_LIMIT_MEMORY_MAX_ENTRIES', '3')
    vi.stubEnv('RATE_LIMIT_MEMORY_CLEANUP_BATCH_SIZE', '1')
    const base = Date.now()

    await checkRateLimit({ ...options('live-first'), windowMs: 1_000 })
    await checkRateLimit({ ...options('expires-first'), windowMs: 10 })
    await checkRateLimit({ ...options('expires-second'), windowMs: 10 })

    vi.setSystemTime(base + 10)
    await checkRateLimit({ ...options('new-first'), windowMs: 1_000 })
    await checkRateLimit({ ...options('new-second'), windowMs: 1_000 })

    const evictedLiveEntry = await checkRateLimit({ ...options('live-first'), windowMs: 1_000 })

    expect(evictedLiveEntry.allowed).toBe(true)
  })

  it('caps an excessive configured memory capacity at ten thousand entries', async () => {
    vi.stubEnv('RATE_LIMIT_MEMORY_MAX_ENTRIES', '1000000')
    vi.stubEnv('RATE_LIMIT_MEMORY_CLEANUP_BATCH_SIZE', '1')

    for (let index = 0; index <= 10_000; index++) {
      await checkRateLimit({ ...options(`capacity-${index}`), windowMs: 3_600_000 })
    }

    const firstAfterCap = await checkRateLimit({
      ...options('capacity-0'),
      windowMs: 3_600_000,
    })

    expect(firstAfterCap.allowed).toBe(true)
  }, 20_000)

  it('adds a finite deadline to Upstash requests', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'upstash-token')
    const timeoutSignal = new AbortController().signal
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal)
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify([{ result: 1 }, { result: 60_000 }]), { status: 200 }),
      )

    const result = await checkRateLimit(options('upstash'))

    expect(result.source).toBe('upstash')
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Number))
    expect(timeoutSpy.mock.calls[0]?.[0]).toBeLessThanOrEqual(5_000)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.upstash.io/pipeline',
      expect.objectContaining({ signal: timeoutSignal }),
    )
  })

  it('caps an excessive Upstash deadline at five seconds', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'upstash-token')
    vi.stubEnv('RATE_LIMIT_UPSTASH_TIMEOUT_MS', '999999')
    const timeoutSignal = new AbortController().signal
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal)
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify([{ result: 1 }, { result: 60_000 }]), { status: 200 }),
      )

    const result = await checkRateLimit(options('upstash-capped'))

    expect(result.source).toBe('upstash')
    expect(timeoutSpy).toHaveBeenCalledWith(5_000)
  })

  it('never logs an Upstash response body when falling back to memory', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'upstash-token')
    const marker = 'UPSTREAM_PRIVATE_MARKER'
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    global.fetch = vi.fn().mockResolvedValue(new Response(marker, { status: 503 }))

    const result = await checkRateLimit(options('sanitized'))

    expect(result.source).toBe('memory')
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(marker)
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('upstash-token')
  })
})
