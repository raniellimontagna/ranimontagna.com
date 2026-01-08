import { render, screen } from '@/tests/test-utils'
import type { Post } from '../../lib/blog'
import { FeaturedPost } from '../featured-post'

const mockPost: Post = {
  slug: 'test-post',
  metadata: {
    title: 'Test Post',
    description: 'Test description',
    date: '2024-01-01',
    published: true,
    tags: ['react', 'testing'],
    coverImage: 'https://example.com/image.jpg',
  },
  content: 'Test content',
}

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
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
    expect(screen.getByAltText('Test Post')).toHaveAttribute('src', 'https://example.com/image.jpg')
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
    expect(img).toHaveAttribute('src', expect.stringContaining('unsplash.com'))
  })

  it('renders tags', () => {
    render(<FeaturedPost post={mockPost} />)

    expect(screen.getByText('#react')).toBeInTheDocument()
    expect(screen.getByText('#testing')).toBeInTheDocument()
  })

  it('renders without tags', () => {
    const postWithoutTags = {
      ...mockPost,
      metadata: {
        ...mockPost.metadata,
        tags: undefined,
      },
    }

    render(<FeaturedPost post={postWithoutTags} />)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
  })
})
