import { getAdjacentPosts, getAllPosts, getPostBySlug } from '@/lib/blog'
import { generateStaticParams } from './page'

// Mock blog utilities
vi.mock('@/lib/blog', () => ({
  getAllPosts: vi.fn(() => [
    {
      slug: 'test-post',
      metadata: {
        title: 'Test Post Title',
        date: '2025-12-15',
        description: 'A test post description',
        tags: ['react', 'test'],
      },
      content: '# Hello World\n\nThis is test content.',
    },
    {
      slug: 'second-post',
      metadata: {
        title: 'Second Post',
        date: '2025-12-14',
        description: 'Another test post',
        tags: ['next'],
      },
      content: 'Second content',
    },
  ]),
  getPostBySlug: vi.fn(() => ({
    slug: 'test-post',
    metadata: {
      title: 'Test Post Title',
      date: '2025-12-15',
      description: 'A test post description',
      tags: ['react', 'test'],
    },
    content: '# Hello World\n\nThis is test content.',
  })),
  getAdjacentPosts: vi.fn(() => ({
    prev: null,
    next: null,
  })),
}))

describe('PostPage', () => {
  describe('generateStaticParams', () => {
    it('should generate params for all posts in all locales', async () => {
      const params = await generateStaticParams()

      expect(params.length).toBeGreaterThan(0)
      expect(params[0]).toHaveProperty('slug')
      expect(params[0]).toHaveProperty('locale')
    })

    it('should include all locales', async () => {
      const params = await generateStaticParams()
      const locales = params.map((p) => p.locale)

      expect(locales).toContain('pt')
      expect(locales).toContain('en')
      expect(locales).toContain('es')
    })

    it('should call getAllPosts for each locale', async () => {
      await generateStaticParams()

      expect(getAllPosts).toHaveBeenCalledWith('pt')
      expect(getAllPosts).toHaveBeenCalledWith('en')
      expect(getAllPosts).toHaveBeenCalledWith('es')
    })
  })

  describe('blog utilities', () => {
    it('getPostBySlug should return a post', () => {
      const post = getPostBySlug('test-post', 'pt')

      expect(post).toBeDefined()
      expect(post.slug).toBe('test-post')
    })

    it('getAdjacentPosts should return prev and next', () => {
      const adjacent = getAdjacentPosts('test-post', 'pt')

      expect(adjacent).toHaveProperty('prev')
      expect(adjacent).toHaveProperty('next')
    })
  })
})
