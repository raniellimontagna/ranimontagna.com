import type { BlogCacheStore, CacheEnvelope, Post, PostDocument } from '../blog.types'
import { createBlogRepository } from '../blog-repository'

const createPost = (slug: string): Post => ({
  slug,
  metadata: {
    title: slug,
    date: '2024-01-01',
    description: `${slug} description`,
    published: true,
    tags: ['react'],
  },
  content: `# ${slug}`,
})

const createEnvelope = <T>(
  value: T,
  overrides: Partial<CacheEnvelope<T>> = {},
): CacheEnvelope<T> => ({
  value,
  freshUntil: Date.now() + 60_000,
  staleUntil: Date.now() + 120_000,
  cachedAt: Date.now(),
  version: 1,
  ...overrides,
})

const createDocument = (
  slug: string,
  metadata: Partial<Post['metadata']> = {},
): PostDocument => ({
  ...createPost(slug),
  metadata: { ...createPost(slug).metadata, ...metadata },
  path: `posts/en/${slug}.mdx`,
  sha: `sha-${slug}`,
})

const createCache = (
  getMock: (key: string) => Promise<unknown> = vi.fn().mockResolvedValue(null),
): BlogCacheStore => ({
  supportsLocks: true,
  async get<T>(key: string): Promise<CacheEnvelope<T> | null> {
    return (await getMock(key)) as CacheEnvelope<T> | null
  },
  set: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn(),
  acquireLock: vi.fn().mockResolvedValue(true),
  releaseLock: vi.fn().mockResolvedValue(undefined),
  getNamespaceVersion: vi.fn().mockResolvedValue('1'),
  bumpNamespaceVersion: vi.fn().mockResolvedValue('2'),
})

describe('blog repository', () => {
  it('returns stale cached posts when the source fails', async () => {
    const cache = {
      supportsLocks: true,
      get: vi.fn().mockResolvedValue(
        createEnvelope([createPost('cached-post')], {
          freshUntil: Date.now() - 5_000,
          staleUntil: Date.now() + 60_000,
        }),
      ),
      set: vi.fn(),
      delete: vi.fn(),
      acquireLock: vi.fn().mockResolvedValue(true),
      releaseLock: vi.fn().mockResolvedValue(undefined),
      getNamespaceVersion: vi.fn().mockResolvedValue('1'),
      bumpNamespaceVersion: vi.fn().mockResolvedValue('2'),
    }

    const source = {
      listPostIndex: vi.fn().mockRejectedValue(new Error('github down')),
      getPostDocument: vi.fn(),
    }

    const repository = createBlogRepository({ cache, source })

    await expect(repository.getAllPosts('en')).resolves.toEqual([
      expect.objectContaining({ slug: 'cached-post' }),
    ])
  })

  it('coalesces concurrent requests for the same locale', async () => {
    const sourcePosts = [createPost('source-post')]
    const cache = {
      supportsLocks: true,
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      acquireLock: vi.fn().mockResolvedValue(true),
      releaseLock: vi.fn().mockResolvedValue(undefined),
      getNamespaceVersion: vi.fn().mockResolvedValue('1'),
      bumpNamespaceVersion: vi.fn().mockResolvedValue('2'),
    }
    const source = {
      listPostIndex: vi.fn().mockResolvedValue([
        {
          slug: 'source-post',
          path: 'posts/en/source-post.mdx',
          sha: 'sha-1',
          filenameDate: '2024-01-01',
        },
      ]),
      getPostDocument: vi.fn().mockImplementation(async () => {
        await Promise.resolve()
        return { ...sourcePosts[0], path: 'posts/en/source-post.mdx', sha: 'sha-1' }
      }),
    }

    const repository = createBlogRepository({ cache, source })

    const [first, second] = await Promise.all([
      repository.getAllPosts('en'),
      repository.getAllPosts('en'),
    ])

    expect(first).toEqual(second)
    expect(source.listPostIndex).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['draft', { published: false }],
    ['future', { date: '2999-01-01' }],
  ])('does not return a fresh cached %s post by slug', async (_label, metadata) => {
    const document = createDocument('private-post', metadata)
    const cache = createCache(vi.fn().mockResolvedValue(createEnvelope(document)))
    const source = { listPostIndex: vi.fn(), getPostDocument: vi.fn() }
    const repository = createBlogRepository({ cache, source })

    await expect(repository.getPostBySlug('private-post', 'en')).resolves.toBeNull()
    expect(source.getPostDocument).not.toHaveBeenCalled()
  })

  it.each([
    ['draft', { published: false }],
    ['future', { date: '2999-01-01' }],
  ])('does not return a fresh source %s post by slug', async (_label, metadata) => {
    const cache = createCache()
    const source = {
      listPostIndex: vi.fn(),
      getPostDocument: vi.fn().mockResolvedValue(createDocument('private-post', metadata)),
    }
    const repository = createBlogRepository({ cache, source })

    await expect(repository.getPostBySlug('private-post', 'en')).resolves.toBeNull()
  })

  it('does not expose a stale private fallback when source refresh fails', async () => {
    const document = createDocument('draft-post', { published: false })
    const cache = createCache(
      vi.fn().mockResolvedValue(
        createEnvelope(document, {
          freshUntil: Date.now() - 10_000,
          staleUntil: Date.now() + 60_000,
        }),
      ),
    )
    const source = {
      listPostIndex: vi.fn(),
      getPostDocument: vi.fn().mockRejectedValue(new Error('source unavailable')),
    }
    const repository = createBlogRepository({ cache, source })

    await expect(repository.getPostBySlug('draft-post', 'en')).resolves.toBeNull()
  })

  it('returns a public source post by slug', async () => {
    const cache = createCache()
    const source = {
      listPostIndex: vi.fn(),
      getPostDocument: vi.fn().mockResolvedValue(createDocument('public-post')),
    }
    const repository = createBlogRepository({ cache, source })

    await expect(repository.getPostBySlug('public-post', 'en')).resolves.toEqual(
      expect.objectContaining({ slug: 'public-post' }),
    )
  })

  it('fails closed for an unsafe document left in cache by an older deployment', async () => {
    const document = { ...createDocument('unsafe-post'), content: '<script>marker()</script>' }
    const cache = createCache(vi.fn().mockResolvedValue(createEnvelope(document)))
    const source = { listPostIndex: vi.fn(), getPostDocument: vi.fn() }
    const repository = createBlogRepository({ cache, source })

    await expect(repository.getPostBySlug('unsafe-post', 'en')).resolves.toBeNull()
  })

  it('returns metadata-only summaries from listings', async () => {
    const cache = createCache()
    const source = {
      listPostIndex: vi.fn().mockResolvedValue([
        {
          slug: 'summary-post',
          path: 'posts/en/summary-post.mdx',
          sha: 'sha-summary-post',
          filenameDate: '2024-01-01',
        },
      ]),
      getPostDocument: vi.fn().mockResolvedValue({
        ...createDocument('summary-post'),
        content: '# DISTINCTIVE_PRIVATE_BODY_MARKER',
      }),
    }
    const repository = createBlogRepository({ cache, source })

    const posts = await repository.getAllPosts('en')

    expect(posts).toEqual([
      expect.objectContaining({ slug: 'summary-post', metadata: expect.any(Object) }),
    ])
    expect(posts[0]).not.toHaveProperty('content')
    expect(JSON.stringify(posts)).not.toContain('DISTINCTIVE_PRIVATE_BODY_MARKER')
  })

  it('bounds document reads to four and preserves stable date order', async () => {
    const cache = createCache()
    const entries = Array.from({ length: 9 }, (_, index) => ({
      slug: `post-${index}`,
      path: `posts/en/post-${index}.mdx`,
      sha: `sha-post-${index}`,
      filenameDate: `2024-01-${String(index + 1).padStart(2, '0')}`,
    }))
    let active = 0
    let maximum = 0
    const source = {
      listPostIndex: vi.fn().mockResolvedValue(entries),
      getPostDocument: vi.fn().mockImplementation(async (_locale, slug, entry) => {
        active += 1
        maximum = Math.max(maximum, active)
        await new Promise((resolve) => setTimeout(resolve, 2))
        active -= 1
        return createDocument(slug, { date: entry.filenameDate })
      }),
    }
    const repository = createBlogRepository({ cache, source })

    const [first, second] = await Promise.all([
      repository.getAllPosts('en'),
      repository.getAllPosts('en'),
    ])

    expect(maximum).toBeLessThanOrEqual(4)
    expect(first.map((post) => post.slug)).toEqual([
      'post-8',
      'post-7',
      'post-6',
      'post-5',
      'post-4',
      'post-3',
      'post-2',
      'post-1',
      'post-0',
    ])
    expect(second).toEqual(first)
    expect(source.listPostIndex).toHaveBeenCalledTimes(1)
  })
})
