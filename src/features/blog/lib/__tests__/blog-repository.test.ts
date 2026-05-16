import type { CacheEnvelope, Post } from '../blog.types'
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

describe('blog repository', () => {
  it('returns stale cached posts when the source fails', async () => {
    const cache = {
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
})
