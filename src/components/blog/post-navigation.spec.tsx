import { render, screen } from '@/tests/functions'
import { PostNavigation } from './post-navigation'

describe('PostNavigation', () => {
  it('should render with both prev and next posts', () => {
    render(
      <PostNavigation
        prevPost={{ slug: 'prev-post', title: 'Previous Post' }}
        nextPost={{ slug: 'next-post', title: 'Next Post' }}
      />,
    )

    expect(screen.getByText('Previous Post')).toBeInTheDocument()
    expect(screen.getByText('Next Post')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /previous post/i })).toHaveAttribute(
      'href',
      '/blog/prev-post',
    )
    expect(screen.getByRole('link', { name: /next post/i })).toHaveAttribute(
      'href',
      '/blog/next-post',
    )
  })

  it('should render with only prev post', () => {
    render(<PostNavigation prevPost={{ slug: 'prev-post', title: 'Previous Post' }} />)

    expect(screen.getByText('Previous Post')).toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('should render with only next post', () => {
    render(<PostNavigation nextPost={{ slug: 'next-post', title: 'Next Post' }} />)

    expect(screen.getByText('Next Post')).toBeInTheDocument()
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
  })

  it('should render empty state when no posts provided', () => {
    const { container } = render(<PostNavigation />)

    expect(container.querySelector('nav')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
