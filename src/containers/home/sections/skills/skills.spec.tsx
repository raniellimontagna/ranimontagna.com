// @vitest-environment jsdom
import { render, screen } from '@/tests/functions'
import { Skills } from './skills'

// Mock InfiniteMarquee since it uses CSS animations that might be hard to test in JSDOM
vi.mock('@/components/ui/infinite-marquee', () => ({
  InfiniteMarquee: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marquee">{children}</div>
  ),
}))

describe('Skills', () => {
  it('should render the Skills component', () => {
    render(<Skills />)

    // Check if the section title is rendered (this comes from translations)
    // Since we mock useTranslations, we expect the key to be returned or we can check structural elements
    expect(screen.getByTestId('marquee')).toBeInTheDocument()
  })

  it('should render skill items', () => {
    render(<Skills />)

    // Check for some known skills
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })
})
