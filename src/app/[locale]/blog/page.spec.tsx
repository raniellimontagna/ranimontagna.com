import { render, screen } from '@/tests/functions'
import BlogPage from './page'

// Mock getAllPosts
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
      content: 'Test content',
    },
    {
      slug: 'second-post',
      metadata: {
        title: 'Second Post Title',
        date: '2025-12-14',
        description: 'Another test post',
        tags: ['next'],
      },
      content: 'Second content',
    },
  ]),
}))

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() =>
    Promise.resolve((key: string) => {
      const translations: Record<string, string> = {
        title: 'Blog',
        subtitle: 'Latest posts',
        noPosts: 'No posts found',
      }
      return translations[key] || key
    }),
  ),
}))

describe('BlogPage', () => {
  it('should render the blog page with title', async () => {
    const page = await BlogPage({ params: Promise.resolve({ locale: 'pt' }) })
    render(page)

    expect(screen.getByRole('heading', { level: 1, name: 'Blog' })).toBeInTheDocument()
  })

  it('should render featured post', async () => {
    const page = await BlogPage({ params: Promise.resolve({ locale: 'pt' }) })
    render(page)

    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('should render remaining posts', async () => {
    const page = await BlogPage({ params: Promise.resolve({ locale: 'pt' }) })
    render(page)

    expect(screen.getByText('Second Post Title')).toBeInTheDocument()
  })
})
