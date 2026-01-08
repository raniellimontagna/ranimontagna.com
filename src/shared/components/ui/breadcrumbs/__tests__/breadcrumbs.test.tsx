import { render, screen } from '@/tests/test-utils'
import { Breadcrumbs } from '../breadcrumbs'

describe('Breadcrumbs', () => {
  it('renders home link correctly', () => {
    render(<Breadcrumbs items={[]} />)

    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders items with links correctly', () => {
    const items = [{ label: 'Section', href: '/section' }, { label: 'Page' }]
    render(<Breadcrumbs items={items} />)

    // Check Section link
    const sectionLink = screen.getByRole('link', { name: 'Section' })
    expect(sectionLink).toBeInTheDocument()
    expect(sectionLink).toHaveAttribute('href', '/section')

    // Check Page text (not a link)
    expect(screen.getByText('Page')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Page' })).not.toBeInTheDocument()
  })

  it('renders separators', () => {
    const items = [{ label: 'Section' }]
    const { container } = render(<Breadcrumbs items={items} />)

    // AltArrowRight icon usually renders an svg
    const separators = container.querySelectorAll('svg')
    // 1 home icon + 1 separator = 2 svgs
    expect(separators.length).toBeGreaterThanOrEqual(2)
  })
})
