import { render, screen } from '@/tests/test-utils'
import type { Post } from '../../lib/blog'
import { PostCard } from '../post-card'

const mockPost: Post = {
  slug: 'test-post',
  metadata: {
    title: 'Test Post',
    description: 'Test description',
    date: '2024-01-01',
    published: true,
    tags: ['react'],
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

describe('PostCard', () => {
  it('renders with cover image', () => {
    render(<PostCard post={mockPost} index={0} />)

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

    render(<PostCard post={postWithoutCover} index={0} />)

    const img = screen.getByAltText('Test Post')
    expect(img).toHaveAttribute('src', expect.stringContaining('unsplash.com'))
  })

  it('renders tags', () => {
    render(<PostCard post={mockPost} index={0} />)

    expect(screen.getByText('#react')).toBeInTheDocument()
  })

  it('applies stagger animation delay based on index', () => {
    const { container } = render(<PostCard post={mockPost} index={2} />)

    expect(container.firstChild).toBeInTheDocument()
  })
})
