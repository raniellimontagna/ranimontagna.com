import PostPage from '@/app/[locale]/blog/[slug]/page'
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
  getPostBySlug: vi.fn().mockResolvedValue({
    slug: 'featured-post',
    metadata: {
      title: 'Featured Post',
      date: '2024-01-01',
      description: 'Description 1',
      tags: ['tag1'],
      coverImage: '/image1.jpg',
    },
    content: 'Content 1',
  }),
  getAdjacentPosts: vi.fn().mockResolvedValue({ prev: undefined, next: undefined }),
}))

vi.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => <div>{source}</div>,
}))

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  setRequestLocale: vi.fn(),
}))

describe('Blog Page', () => {
  it('renders blog page correctly', async () => {
    const page = await BlogPage({
      params: Promise.resolve({ locale: 'pt' }),
    })

    const { container } = render(page)

    expect(container.firstElementChild).toHaveAttribute('data-spectral-zone', 'quiet')
    expect(container.firstElementChild).toHaveClass('bg-background/80')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
    expect(container.querySelector(`.${['atmospheric', 'grid'].join('-')}`)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('marks article pages as quiet spectral zones without the obsolete grid', async () => {
    const page = await PostPage({
      params: Promise.resolve({ locale: 'pt', slug: 'featured-post' }),
    })

    const { container } = render(page)

    expect(container.firstElementChild).toHaveAttribute('data-spectral-zone', 'quiet')
    expect(container.firstElementChild).toHaveClass('bg-background/80')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
    expect(container.querySelector(`.${['atmospheric', 'grid'].join('-')}`)).not.toBeInTheDocument()
  })
})
