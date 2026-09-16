import { render, screen } from '@/tests/test-utils'
import { Services } from '../services'

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    t.raw = (key: string) => key
    return t
  },
}))

vi.mock('@/shared/components/animations', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MagneticHover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RevealText: ({ text }: { text: string }) => <h2>{text}</h2>,
  StaggerContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Services Component (Atto bridge)', () => {
  it('renders the section with title and subtitle', () => {
    const { container } = render(<Services />)
    expect(container.querySelector('#services')).toHaveAttribute('data-spectral-zone', 'balanced')
    expect(screen.getByText('badge')).toBeInTheDocument()
    expect(screen.getByText('title.part1 title.part2')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('lists the four Atto fronts', () => {
    render(<Services />)
    expect(screen.getAllByTestId('atto-front')).toHaveLength(4)
    expect(screen.getByText('list.marketing.title')).toBeInTheDocument()
  })

  it('links the CTAs to attodev.com.br, not to a personal quote', () => {
    render(<Services />)
    const primary = screen.getByRole('link', { name: /cta.button/ })
    expect(primary).toHaveAttribute('href', 'https://attodev.com.br')
    expect(primary).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: /cta.secondary/ })).toHaveAttribute(
      'href',
      'https://attodev.com.br/#cases',
    )
    expect(screen.queryByText(/orçamento|quote/i)).not.toBeInTheDocument()
  })
})
