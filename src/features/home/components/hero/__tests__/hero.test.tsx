import { fireEvent, render, screen } from '@/tests/test-utils'
import { Hero } from '../hero'
import { ScrollIndicator } from '../hero-content'

vi.mock('next/image', () => ({
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    priority?: boolean
  }) => (
    // biome-ignore lint/performance/noImgElement: Test double for next/image.
    <img alt={alt} {...props} />
  ),
}))

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
    expect(screen.getByText('description')).toBeInTheDocument()
    expect(screen.getByText('seoDescription')).toBeInTheDocument()
    expect(screen.getByText('cta.projects')).toBeInTheDocument()
    expect(screen.getByText('cta.contact')).toBeInTheDocument()
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

  it('does nothing when the about section is not on the page yet', () => {
    render(<ScrollIndicator />)

    const getElementByIdMock = vi.spyOn(document, 'getElementById').mockReturnValue(null)

    const button = screen.getByTestId('scroll-down-indicator')

    expect(() => fireEvent.click(button)).not.toThrow()
    expect(getElementByIdMock).toHaveBeenCalledWith('about')
  })
})
