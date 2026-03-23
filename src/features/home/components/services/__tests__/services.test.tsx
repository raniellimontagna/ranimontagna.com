import { render, screen } from '@/tests/test-utils'
import { Services } from '../services'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    t.raw = () => ['Feature 1', 'Feature 2', 'Feature 3']
    return t
  },
}))

// Mock animations
vi.mock('@/shared/components/animations', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MagneticHover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RevealText: ({ text }: { text: string }) => <span>{text}</span>,
  StaggerContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock ServiceCard
vi.mock('@/shared/components/ui', () => ({
  ServiceCard: ({ title }: { title: string }) => <div data-testid="service-card">{title}</div>,
}))

describe('Services Component', () => {
  it('renders services section', () => {
    render(<Services />)
    expect(screen.getByText('badge')).toBeInTheDocument()
    expect(screen.getByText('title.part1 title.part2')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders all service cards', () => {
    render(<Services />)
    const serviceCards = screen.getAllByTestId('service-card')
    expect(serviceCards.length).toBeGreaterThan(0)
  })

  it('renders CTA section', () => {
    render(<Services />)
    expect(screen.getByText('cta.badge')).toBeInTheDocument()
    expect(screen.getByText('cta.title')).toBeInTheDocument()
    expect(screen.getByText('cta.subtitle')).toBeInTheDocument()
    expect(screen.getByText('cta.button')).toBeInTheDocument()
  })

  it('links CTA directly to the contact section', () => {
    render(<Services />)

    const ctaLink = screen.getByRole('link', { name: /cta\.button/i })
    expect(ctaLink).toHaveAttribute('href', '#contact')
  })
})
