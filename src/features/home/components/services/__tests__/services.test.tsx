import { fireEvent, render, screen } from '@/tests/test-utils'
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
  StaggerContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock ServiceCard
vi.mock('@/shared/components/ui', () => ({
  ServiceCard: ({ title }: { title: string }) => <div data-testid="service-card">{title}</div>,
}))

describe('Services Component', () => {
  beforeEach(() => {
    // Mock getElementById and scrollIntoView
    document.getElementById = vi.fn((id: string) => {
      if (id === 'contact') {
        return {
          scrollIntoView: vi.fn(),
        } as unknown as HTMLElement
      }
      return null
    })
  })

  it('renders services section', () => {
    render(<Services />)
    expect(screen.getByText('badge')).toBeInTheDocument()
    expect(screen.getByText('title.part1')).toBeInTheDocument()
    expect(screen.getByText('title.part2')).toBeInTheDocument()
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

  it('scrolls to contact section when CTA button is clicked', () => {
    const scrollIntoViewMock = vi.fn()
    document.getElementById = vi.fn((id: string) => {
      if (id === 'contact') {
        return {
          scrollIntoView: scrollIntoViewMock,
        } as unknown as HTMLElement
      }
      return null
    })

    render(<Services />)

    const ctaButton = screen.getByRole('button', { name: /cta\.button/i })
    fireEvent.click(ctaButton)

    expect(document.getElementById).toHaveBeenCalledWith('contact')
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('handles missing contact section gracefully', () => {
    document.getElementById = vi.fn(() => null)

    render(<Services />)

    const ctaButton = screen.getByRole('button', { name: /cta\.button/i })

    // Should not throw error
    expect(() => fireEvent.click(ctaButton)).not.toThrow()
  })
})
