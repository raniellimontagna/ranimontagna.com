import { getAdjacentPosts, getAllPosts, getPostBySlug } from '../blog'

const { mockRepositoryGetAllPosts, mockRepositoryGetPostBySlug } = vi.hoisted(() => ({
  mockRepositoryGetAllPosts: vi.fn(),
  mockRepositoryGetPostBySlug: vi.fn(),
}))

vi.mock('next/cache', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mocking cache wrapper
  unstable_cache: (fn: any) => fn,
}))

vi.mock('../blog-repository', () => ({
  createBlogRepository: () => ({
    getAllPosts: mockRepositoryGetAllPosts,
    getPostBySlug: mockRepositoryGetPostBySlug,
  }),
}))

describe('blog facade', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockRepositoryGetAllPosts.mockResolvedValue([
      {
        slug: 'featured-post',
        metadata: {
          title: 'Featured Post',
          date: '2024-01-02',
          description: 'Featured Description',
          tags: ['featured'],
          published: true,
        },
        content: '# Featured',
      },
      {
        slug: 'older-post',
        metadata: {
          title: 'Older Post',
          date: '2024-01-01',
          description: 'Older Description',
          tags: ['older'],
          published: true,
        },
        content: '# Older',
      },
    ])

    mockRepositoryGetPostBySlug.mockImplementation(async (slug: string) => {
      const posts = await mockRepositoryGetAllPosts()
      return posts.find((post: { slug: string }) => post.slug === slug) ?? null
    })
  })

  it('delegates getAllPosts to the repository', async () => {
    const posts = await getAllPosts('en')

    expect(posts).toHaveLength(2)
    expect(posts[0].slug).toBe('featured-post')
    expect(mockRepositoryGetAllPosts).toHaveBeenCalledWith('en')
  })

  it('delegates getPostBySlug to the repository', async () => {
    const post = await getPostBySlug('featured-post', 'en')

    expect(post).toEqual(expect.objectContaining({ slug: 'featured-post' }))
    expect(mockRepositoryGetPostBySlug).toHaveBeenCalledWith('featured-post', 'en')
  })

  it('returns adjacent posts from the sorted post list', async () => {
    const adjacent = await getAdjacentPosts('older-post', 'en')

    expect(adjacent.next).toEqual(expect.objectContaining({ slug: 'featured-post' }))
    expect(adjacent.prev).toBeNull()
  })

  it('returns null adjacent posts when the slug is missing', async () => {
    const adjacent = await getAdjacentPosts('missing-post', 'en')

    expect(adjacent).toEqual({ prev: null, next: null })
  })
})
