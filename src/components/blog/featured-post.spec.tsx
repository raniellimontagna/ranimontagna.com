import { render, screen } from '@/tests/functions'
import { FeaturedPost } from './featured-post'

const mockPost = {
  slug: 'test-post',
  metadata: {
    title: 'Test Post Title',
    date: '2025-12-17',
    description: 'This is a test post description',
    tags: ['react', 'testing'],
  },
  content: 'Post content',
}

describe('FeaturedPost', () => {
  it('should render the featured post with title', () => {
    render(<FeaturedPost post={mockPost} />)

    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('should render the post description', () => {
    render(<FeaturedPost post={mockPost} />)

    expect(screen.getByText('This is a test post description')).toBeInTheDocument()
  })

  it('should render tags', () => {
    render(<FeaturedPost post={mockPost} />)

    expect(screen.getByText('#react')).toBeInTheDocument()
    expect(screen.getByText('#testing')).toBeInTheDocument()
  })

  it('should link to the correct slug', () => {
    render(<FeaturedPost post={mockPost} />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/test-post')
  })
})
