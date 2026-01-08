import { render, screen } from '@/tests/test-utils'
import { PostNavigation } from '../post-navigation'

describe('PostNavigation Component', () => {
  it('renders both previous and next posts', () => {
    const prevPost = { slug: 'prev-post', title: 'Previous Post' }
    const nextPost = { slug: 'next-post', title: 'Next Post' }

    render(<PostNavigation prevPost={prevPost} nextPost={nextPost} />)

    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Previous Post')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /previous post/i })).toHaveAttribute(
      'href',
      '/blog/prev-post',
    )

    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('Next Post')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /next post/i })).toHaveAttribute(
      'href',
      '/blog/next-post',
    )
  })

  it('renders only previous post', () => {
    const prevPost = { slug: 'prev-post', title: 'Previous Post' }
    render(<PostNavigation prevPost={prevPost} />)

    expect(screen.getByText('Previous Post')).toBeInTheDocument()
    expect(screen.queryByText('Next Post')).not.toBeInTheDocument()
  })

  it('renders only next post', () => {
    const nextPost = { slug: 'next-post', title: 'Next Post' }
    render(<PostNavigation nextPost={nextPost} />)

    expect(screen.getByText('Next Post')).toBeInTheDocument()
    expect(screen.queryByText('Previous Post')).not.toBeInTheDocument()
  })

  it('renders empty navigation when no posts', () => {
    render(<PostNavigation />)
    // Should render the container but empty/spacers
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
