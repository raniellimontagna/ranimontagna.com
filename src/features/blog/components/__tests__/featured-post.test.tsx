import { render, screen } from '@/tests/test-utils'
import type { PostSummary } from '../../lib/blog'
import { FeaturedPost } from '../featured-post'

const mockPost: PostSummary = {
  slug: 'test-post',
  metadata: {
    title: 'Test Post',
    description: 'Test description',
    date: '2024-01-01',
    published: true,
    tags: ['react', 'testing'],
    coverImage: 'https://images.unsplash.com/image.jpg',
  },
}

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('FeaturedPost', () => {
  it('renders with cover image', () => {
    render(<FeaturedPost post={mockPost} />)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    const image = screen.getByAltText('Test Post')
    expect(image.getAttribute('src')).toContain(
      encodeURIComponent('https://images.unsplash.com/image.jpg'),
    )
    expect(image).toHaveAttribute('loading', 'eager')
    expect(image).toHaveAttribute('fetchpriority', 'high')
    expect(image).toHaveAttribute(
      'sizes',
      '(max-width: 768px) 100vw, (max-width: 1200px) calc(100vw - 3rem), 1152px',
    )

    for (let ancestor = image.parentElement; ancestor; ancestor = ancestor.parentElement) {
      expect(ancestor.style.opacity).not.toBe('0')
      expect(ancestor.style.filter).not.toContain('blur')
    }
  })

  it('renders with default cover image when not provided', () => {
    const postWithoutCover = {
      ...mockPost,
      metadata: {
        ...mockPost.metadata,
        coverImage: undefined,
      },
    }

    render(<FeaturedPost post={postWithoutCover} />)

    const img = screen.getByAltText('Test Post')
    expect(img.getAttribute('src')).toContain(encodeURIComponent('/images/blog-fallback.webp'))
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('renders tags', () => {
    render(<FeaturedPost post={mockPost} />)

    expect(screen.getByText('#react')).toBeInTheDocument()
    expect(screen.getByText('#testing')).toBeInTheDocument()
  })

  it('renders with an empty tag list', () => {
    const postWithoutTags = {
      ...mockPost,
      metadata: {
        ...mockPost.metadata,
        tags: [],
      },
    }

    render(<FeaturedPost post={postWithoutTags} />)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
  })
})
