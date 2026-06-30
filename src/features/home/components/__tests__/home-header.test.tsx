import { render, screen } from '@/tests/test-utils'
import { HomeHeader } from '../home-header'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

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

vi.mock('@/shared/config/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    prefetch,
    ...props
  }: {
    children: React.ReactNode
    href: string
    prefetch?: boolean
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} data-prefetch={String(prefetch)} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../home-header-controls', () => ({
  HomeHeaderControls: () => (
    <div data-testid="home-header-controls">
      <button type="button" aria-label="Open command palette">
        Command
      </button>
    </div>
  ),
}))

describe('HomeHeader', () => {
  it('keeps the interactive controls in the top bar', async () => {
    const header = await HomeHeader({ locale: 'en' })

    render(header)

    expect(screen.getByTestId('home-header-controls')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open command palette/i })).toBeInTheDocument()
  })

  it('does not prefetch the blog route from the initial home header', async () => {
    const header = await HomeHeader({ locale: 'en' })

    render(header)

    expect(screen.getByText('navigation.blog').closest('a')).toHaveAttribute(
      'data-prefetch',
      'false',
    )
  })
})
