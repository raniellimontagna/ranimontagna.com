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
    await expect(store.acquireLock('blog:test', 1_000)).resolves.toBeNull()
    await expect(store.renewLock('blog:test', 'owner-token', 1_000)).resolves.toBe(false)
    await expect(store.releaseLock('blog:test', 'owner-token')).resolves.toBe(false)
    await expect(store.getNamespaceVersion('blog')).resolves.toBe('1')
  })

  it('treats invalid cache payloads as cache misses', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token')
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify([{ result: '{bad-json' }]), { status: 200 }),
        ),
    )

    const store = createBlogCacheStore()

    await expect(store.get('blog:test')).resolves.toBeNull()
  })

  it('uses an ownership token for atomic lock renewal and release', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token')
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ result: 'OK' }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ result: 1 }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ result: 1 }]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const store = createBlogCacheStore()
    const ownerToken = await store.acquireLock('blog:lock:test', 1_000.2)

    expect(ownerToken).toEqual(expect.any(String))
    const acquireBody = JSON.parse(fetchMock.mock.calls[0][1]?.body as string)
    expect(acquireBody).toEqual([
      ['SET', 'blog:lock:test', ownerToken, 'PX', 1_001, 'NX'],
    ])

    await expect(store.renewLock('blog:lock:test', ownerToken as string, 2_000)).resolves.toBe(
      true,
    )
    const renewBody = JSON.parse(fetchMock.mock.calls[1][1]?.body as string)
    expect(renewBody).toEqual([
      ['EVAL', expect.stringContaining('PEXPIRE'), 1, 'blog:lock:test', ownerToken, 2_000],
    ])

    await expect(store.releaseLock('blog:lock:test', ownerToken as string)).resolves.toBe(true)
    const releaseBody = JSON.parse(fetchMock.mock.calls[2][1]?.body as string)
    expect(releaseBody).toEqual([
      ['EVAL', expect.stringContaining("redis.call('DEL'"), 1, 'blog:lock:test', ownerToken],
    ])
    expect(releaseBody.flat()).not.toContain('GET')
  })

  it('does not report a lock as renewed or released after ownership changes', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token')
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify([{ result: 0 }]), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify([{ result: 0 }]), { status: 200 })),
    )

    const store = createBlogCacheStore()

    await expect(store.renewLock('blog:lock:test', 'expired-owner', 1_000)).resolves.toBe(false)
    await expect(store.releaseLock('blog:lock:test', 'expired-owner')).resolves.toBe(false)
  })
})
