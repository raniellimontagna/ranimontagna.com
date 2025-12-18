import { render, screen } from '@/tests/functions'
import { PostCard } from './post-card'

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

describe('PostCard', () => {
  it('should render the post card with title', () => {
    render(<PostCard post={mockPost} index={0} />)

    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('should render the post description', () => {
    render(<PostCard post={mockPost} index={0} />)

    expect(screen.getByText('This is a test post description')).toBeInTheDocument()
  })

  it('should render tags (max 2)', () => {
    render(<PostCard post={mockPost} index={0} />)

    expect(screen.getByText('#react')).toBeInTheDocument()
    expect(screen.getByText('#testing')).toBeInTheDocument()
  })

  it('should link to the correct slug', () => {
    render(<PostCard post={mockPost} index={0} />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/test-post')
  })
})
