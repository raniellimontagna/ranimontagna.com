import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '../chat.constants'
import {
  callDeepSeek,
  checkRateLimit,
  getRateLimitIdentifier,
  resetRateLimitStateForTests,
} from '../chat.utils'

describe('chat rate limit utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    resetRateLimitStateForTests()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    resetRateLimitStateForTests()
  })

  it('uses the first forwarded IP when available', () => {
    const identifier = getRateLimitIdentifier(
      new Headers({
        'x-forwarded-for': '203.0.113.10, 10.0.0.1',
        'user-agent': 'test-agent',
      }),
    )

    expect(identifier).toBe('ip:203.0.113.10')
  })

  it('creates a stable anonymous fingerprint when no IP headers are present', () => {
    const headers = new Headers({
      'user-agent': 'test-agent',
      'accept-language': 'pt-BR',
      host: 'localhost:3000',
    })

    const identifierA = getRateLimitIdentifier(headers)
    const identifierB = getRateLimitIdentifier(headers)

    expect(identifierA).toBe(identifierB)
    expect(identifierA.startsWith('anon:')).toBe(true)
  })

  it('falls back to in-memory rate limiting when no persistent backend is configured', async () => {
    let lastResult = await checkRateLimit({
      identifier: 'ip:127.0.0.1',
      keyPrefix: 'chat:rate-limit',
      max: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    })

    for (let attempt = 2; attempt <= RATE_LIMIT_MAX; attempt++) {
      lastResult = await checkRateLimit({
        identifier: 'ip:127.0.0.1',
        keyPrefix: 'chat:rate-limit',
        max: RATE_LIMIT_MAX,
        windowMs: RATE_LIMIT_WINDOW_MS,
      })
    }

    const blockedResult = await checkRateLimit({
      identifier: 'ip:127.0.0.1',
      keyPrefix: 'chat:rate-limit',
      max: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    })

    expect(lastResult.allowed).toBe(true)
    expect(lastResult.source).toBe('memory')
    expect(blockedResult.allowed).toBe(false)
    expect(blockedResult.source).toBe('memory')
    expect(blockedResult.remaining).toBe(0)
  })

  it('uses Upstash Redis REST when configured', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'upstash-token')
    vi.stubEnv('CHAT_RATE_LIMIT_PREFIX', 'custom-prefix')

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ result: 1 }, { result: -1 }]), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify([{ result: 1 }]), { status: 200 }))

    const result = await checkRateLimit({
      identifier: 'ip:198.51.100.8',
      keyPrefix: 'custom-prefix',
      max: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    })

    expect(result.allowed).toBe(true)
    expect(result.source).toBe('upstash')
    expect(result.remaining).toBe(RATE_LIMIT_MAX - 1)
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://example.upstash.io/pipeline',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer upstash-token',
          'Content-Type': 'application/json',
        }),
      }),
    )
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://example.upstash.io/pipeline',
      expect.objectContaining({
        body: JSON.stringify([['PEXPIRE', 'custom-prefix:ip:198.51.100.8', RATE_LIMIT_WINDOW_MS]]),
      }),
    )
  })

  it('falls back to memory if the persistent backend fails', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'upstash-token')

    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))

    const result = await checkRateLimit({
      identifier: 'ip:192.0.2.55',
      keyPrefix: 'chat:rate-limit',
      max: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    })

    expect(result.allowed).toBe(true)
    expect(result.source).toBe('memory')
  })
})

describe('DeepSeek provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('skips DeepSeek when no API key is configured', async () => {
    const result = await callDeepSeek('system policy', [{ role: 'user', content: 'Oi' }])

    expect(result).toBeNull()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('sends an OpenAI-compatible streaming request to DeepSeek', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'deepseek-test-key')
    vi.stubEnv('DEEPSEEK_MODEL', 'deepseek-chat')
    global.fetch = vi.fn().mockResolvedValue(new Response('', { status: 200 }))

    await callDeepSeek('system policy', [{ role: 'user', content: 'Oi' }])

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer deepseek-test-key' }),
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'system policy' },
            { role: 'user', content: 'Oi' },
          ],
          stream: true,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      }),
    )
  })

  it('returns null when DeepSeek responds with a non-success status', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'deepseek-test-key')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    global.fetch = vi.fn().mockResolvedValue(new Response('', { status: 503 }))

    const result = await callDeepSeek('system policy', [{ role: 'user', content: 'Oi' }])

    expect(result).toBeNull()
    expect(consoleError).toHaveBeenCalledWith('DeepSeek API error (deepseek-chat): 503')
  })

  it('returns null and logs a fixed diagnostic when the DeepSeek request throws', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'deepseek-test-key')
    const requestError = new Error('sensitive request configuration')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    global.fetch = vi.fn().mockRejectedValue(requestError)

    const result = await callDeepSeek('system policy', [{ role: 'user', content: 'Oi' }])

    expect(result).toBeNull()
    expect(consoleError).toHaveBeenCalledWith('DeepSeek call failed')
    expect(consoleError).not.toHaveBeenCalledWith('DeepSeek call failed', requestError)
  })

  it('returns null and logs only a fixed warning when the DeepSeek request times out', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'deepseek-test-key')
    const timeoutError = Object.assign(new Error('request timed out'), { name: 'AbortError' })
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    global.fetch = vi.fn().mockRejectedValue(timeoutError)

    const result = await callDeepSeek('system policy', [{ role: 'user', content: 'Oi' }])

    expect(result).toBeNull()
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringMatching(/^DeepSeek request timed out after \d+ms$/),
    )
    expect(consoleWarn.mock.calls[0]).toHaveLength(1)
  })
})
