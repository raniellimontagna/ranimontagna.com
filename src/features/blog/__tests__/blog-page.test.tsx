import PostPage from '@/app/[locale]/blog/[slug]/page'
import BlogPage from '@/app/[locale]/blog/page'
import type { Post, PostSummary } from '@/features/blog/lib/blog'
import { render, screen } from '@/tests/test-utils'

const nextImageProps = vi.hoisted(() => [] as Record<string, unknown>[])

// Mocks
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    nextImageProps.push(props)
    const {
      fill: _fill,
      preload: _preload,
      priority: _priority,
      fetchPriority: _fetchPriority,
      alt,
      ...imageProps
    } = props

    // biome-ignore lint/performance/noImgElement: test double for next/image
    return <img alt={String(alt ?? '')} {...imageProps} />
  },
  getImageProps: (props: { src: string; alt: string }) => ({
    props: { src: props.src, alt: props.alt },
  }),
}))

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
  beforeEach(() => {
    nextImageProps.length = 0
  })

  it('renders the new blog index with the Blog JSON-LD, without loading article bodies', async () => {
    const page = await BlogPage({
      params: Promise.resolve({ locale: 'pt' }),
    })
    expect(JSON.stringify(page)).not.toContain('ARTICLE_BODY_MARKER')

    const { container } = render(page)

    expect(container.querySelector('[data-spectral-zone]')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Featured Post/ })).toHaveAttribute(
      'href',
      '/blog/featured-post',
    )
    const jsonLd = container.querySelector('script[type="application/ld+json"]')
    expect(jsonLd).toBeInTheDocument()
    expect(JSON.parse(jsonLd?.textContent ?? '')).toMatchObject({ '@type': 'Blog' })
  })

  it('renders the new article page with its header, body and BlogPosting JSON-LD', async () => {
    const page = await PostPage({
      params: Promise.resolve({ locale: 'pt', slug: 'featured-post' }),
    })

    const { container } = render(page)

    expect(container.querySelector('[data-spectral-zone]')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Featured Post' })).toBeInTheDocument()
    expect(screen.getByText('ARTICLE_BODY_MARKER')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /backToBlog/ })[0]).toHaveAttribute('href', '/blog')
    const jsonLd = container.querySelector('script[type="application/ld+json"]')
    expect(JSON.parse(jsonLd?.textContent ?? '')).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Featured Post',
    })
    const coverProps = nextImageProps.find((props) => props.alt === 'Featured Post')
    expect(coverProps).toMatchObject({ preload: true })
  })

  it('unknown slug triggers notFound', async () => {
    const { getPostBySlug } = await import('@/features/blog/lib/blog')
    vi.mocked(getPostBySlug).mockResolvedValueOnce(null as never)
    await expect(
      PostPage({ params: Promise.resolve({ locale: 'pt', slug: 'missing' }) }),
    ).rejects.toThrow()
  })
})
