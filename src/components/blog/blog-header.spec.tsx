import { render, screen } from '@/tests/functions'
import { BlogHeader } from './blog-header'

// Mock useTheme
vi.mock('@/store/useTheme/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    mounted: true,
    setTheme: vi.fn(),
    initTheme: vi.fn(),
  }),
}))

describe('BlogHeader', () => {
  it('should render the header component', () => {
    const { container } = render(<BlogHeader />)

    expect(container.querySelector('header')).toBeInTheDocument()
  })

  it('should render Blog link', () => {
    render(<BlogHeader />)

    expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
  })

  it('should render navigation', () => {
    const { container } = render(<BlogHeader />)

    expect(container.querySelector('nav')).toBeInTheDocument()
  })
})
