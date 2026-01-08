import { render, screen } from '@/tests/test-utils'
import { Footer } from '../footer'

// Mocks
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    if (key === 'copyright') return `© ${new Date().getFullYear()} All rights reserved`
    return key
  },
}))

vi.mock('@/shared/components/animations', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/shared/store/useTheme/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}))

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // biome-ignore lint/a11y/useAltText: Mock component
    // biome-ignore lint/performance/noImgElement: Mock component
    <img {...props} />
  ),
}))

describe('Footer Component', () => {
  it('renders correctly', () => {
    render(<Footer />)

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByAltText('Logo')).toBeInTheDocument()
    expect(screen.getByText('logo.fullName')).toBeInTheDocument()
  })

  it('displays current year in copyright', () => {
    render(<Footer />)

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`© ${currentYear} All rights reserved`)).toBeInTheDocument()
  })

  it('renders social links', () => {
    render(<Footer />)

    // Social links should be rendered
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders external links with correct attributes', () => {
    render(<Footer />)

    const links = screen.getAllByRole('link')
    const externalLinks = links.filter((link) => link.getAttribute('target') === '_blank')

    externalLinks.forEach((link) => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('uses light theme logo', () => {
    render(<Footer />)

    const logo = screen.getByAltText('Logo')
    expect(logo).toHaveAttribute('src', 'logo/white.svg')
  })
})
