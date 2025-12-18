import { render, screen } from '@/tests/functions'
import { Breadcrumbs } from './breadcrumbs'

describe('Breadcrumbs', () => {
  it('should render home link', () => {
    render(<Breadcrumbs items={[]} />)

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
  })

  it('should render single breadcrumb item without link', () => {
    render(<Breadcrumbs items={[{ label: 'Blog' }]} />)

    expect(screen.getByText('Blog')).toBeInTheDocument()
  })

  it('should render breadcrumb item with link', () => {
    render(<Breadcrumbs items={[{ label: 'Blog', href: '/blog' }]} />)

    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog')
  })

  it('should render multiple breadcrumb items', () => {
    render(<Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: 'Article Title' }]} />)

    expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
    expect(screen.getByText('Article Title')).toBeInTheDocument()
  })
})
