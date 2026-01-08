import BlogPage from '@/app/[locale]/blog/page'
import { render, screen } from '@/tests/test-utils'

// Mocks
vi.mock('@/features/blog/lib/blog', () => ({
  getAllPosts: vi.fn().mockResolvedValue([
    {
      slug: 'featured-post',
      metadata: {
        title: 'Featured Post',
        date: '2024-01-01',
        description: 'Description 1',
        tags: ['tag1'],
        coverImage: '/image1.jpg',
      },
      content: 'Content 1',
    },
    {
      slug: 'regular-post',
      metadata: {
        title: 'Regular Post',
        date: '2024-01-02',
        description: 'Description 2',
        tags: ['tag2'],
        coverImage: '/image2.jpg',
      },
      content: 'Content 2',
    },
  ]),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

describe('Blog Page', () => {
  it('renders blog page correctly', async () => {
    const page = await BlogPage({
      params: Promise.resolve({ locale: 'pt' }),
    })

    render(page)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
