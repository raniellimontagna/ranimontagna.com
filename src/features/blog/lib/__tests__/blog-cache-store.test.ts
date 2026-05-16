import { createBlogCacheStore, resetBlogCacheStateForTests } from '../blog-cache-store'

describe('blog cache store', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    resetBlogCacheStateForTests()
  })

  it('returns noop-safe defaults when redis config is missing', async () => {
    const store = createBlogCacheStore()

    await expect(store.get('blog:test')).resolves.toBeNull()
    await expect(store.acquireLock('blog:test', 1_000)).resolves.toBe(false)
    await expect(store.getNamespaceVersion('blog')).resolves.toBe('1')
  })

  it('treats invalid cache payloads as cache misses', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token')
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ result: '{bad-json' }), { status: 200 })),
    )

    const store = createBlogCacheStore()

    await expect(store.get('blog:test')).resolves.toBeNull()
  })
})
