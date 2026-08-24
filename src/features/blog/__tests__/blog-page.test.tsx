import PostPage from '@/app/[locale]/blog/[slug]/page'
import BlogPage from '@/app/[locale]/blog/page'
import type { Post, PostSummary } from '@/features/blog/lib/blog'
import { render, screen } from '@/tests/test-utils'

// Mocks
vi.mock('@/features/blog/lib/blog', () => {
  const summaries = [
    {
      slug: 'featured-post',
      metadata: {
        title: 'Featured Post',
        date: '2024-01-01',
        description: 'Description 1',
        tags: ['tag1'],
        published: true,
        coverImage: '/image1.jpg',
      },
    },
    {
      slug: 'regular-post',
      metadata: {
        title: 'Regular Post',
        date: '2024-01-02',
        description: 'Description 2',
        tags: ['tag2'],
        published: true,
        coverImage: '/image2.jpg',
      },
    },
  ] satisfies PostSummary[]
  const document = {
    slug: 'featured-post',
    metadata: {
      title: 'Featured Post',
      date: '2024-01-01',
      description: 'Description 1',
      tags: ['tag1'],
      published: true,
      coverImage: '/image1.jpg',
    },
    content: 'ARTICLE_BODY_MARKER',
  } satisfies Post

  return {
    getAllPosts: vi.fn().mockResolvedValue(summaries),
    getPostBySlug: vi.fn().mockResolvedValue(document),
    getAdjacentPosts: vi.fn().mockResolvedValue({ prev: undefined, next: undefined }),
  }
})

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
    expect(JSON.stringify(page)).not.toContain('ARTICLE_BODY_MARKER')

    const { container } = render(page)

    expect(container.firstElementChild).toHaveAttribute('data-spectral-zone', 'quiet')
    expect(container.firstElementChild).toHaveClass('bg-background/80')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
    expect(container.querySelector(`.${['atmospheric', 'grid'].join('-')}`)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    const jsonLd = container.querySelector('script[type="application/ld+json"]')
    expect(jsonLd).toBeInTheDocument()
    expect(JSON.parse(jsonLd?.textContent ?? '')).toMatchObject({ '@type': 'Blog' })
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
    const jsonLd = container.querySelector('script[type="application/ld+json"]')
    expect(jsonLd).toBeInTheDocument()
    expect(JSON.parse(jsonLd?.textContent ?? '')).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Featured Post',
    })
  })
})
