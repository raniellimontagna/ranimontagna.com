import { fireEvent, render, screen } from '@/tests/test-utils'
import { Hero } from '../hero'
import { ScrollIndicator } from '../hero-content'

vi.mock('@/shared/components/ui', () => ({
  TerminalWindow: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="terminal-window" title={title}>
      {children}
    </div>
  ),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue(
    Object.assign((key: string) => key, {
      raw: (key: string) => {
        if (key === 'skills.list') return ['React', 'Next.js']
        return key
      },
      rich: (key: string) => key,
    }),
  ),
}))

describe('Hero Component', () => {
  it('renders correctly', async () => {
    const hero = await Hero()
    render(hero)

    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByTestId('terminal-window')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('greeting')).toBeInTheDocument()

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
  })
})

describe('ScrollIndicator', () => {
  it('scrolls to about section on click', () => {
    render(<ScrollIndicator />)

    const scrollIntoViewMock = vi.fn()
    const getElementByIdMock = vi.fn().mockReturnValue({
      scrollIntoView: scrollIntoViewMock,
    })

    vi.spyOn(document, 'getElementById').mockImplementation(getElementByIdMock)

    const button = screen.getByTestId('scroll-down-indicator')
    fireEvent.click(button)

    expect(getElementByIdMock).toHaveBeenCalledWith('about')
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
  })
})
