import { render, screen } from '@/tests/test-utils'
import { Contact } from '../contact'

// Mocks
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('../contactForm/contactForm', () => ({
  ContactForm: () => <div data-testid="contact-form">Contact Form Mock</div>,
}))

// Mock animations to render immediately
vi.mock('@/shared/components/animations', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Contact Component', () => {
  beforeAll(() => {
    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver
  })

  it('renders section title and subtitle', () => {
    render(<Contact />)
    expect(screen.getByText('title.part1')).toBeInTheDocument()
    expect(screen.getByText('title.part2')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
    expect(screen.getByText('badge')).toBeInTheDocument()
  })

  it('renders contact form', () => {
    render(<Contact />)
    expect(screen.getByTestId('contact-form')).toBeInTheDocument()
    // Text includes "// " prefix and other decorations
    expect(screen.getByText(/form.title/)).toBeInTheDocument()
    expect(screen.getByText(/form.subtitle/)).toBeInTheDocument()
  })

  it('renders contact methods correctly', () => {
    render(<Contact />)
    expect(screen.getByText('methods.title')).toBeInTheDocument()

    // Check for specific method keys
    expect(screen.getByText('methods.email.title')).toBeInTheDocument()
    expect(screen.getByText('methods.linkedin.title')).toBeInTheDocument()
    expect(screen.getByText('methods.phone.title')).toBeInTheDocument()
  })

  it('renders status indicator', () => {
    render(<Contact />)
    expect(screen.getByText('status.available')).toBeInTheDocument()
    expect(screen.getByText('status.response')).toBeInTheDocument()
  })
})
