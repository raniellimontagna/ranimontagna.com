import { render, screen } from '@/tests/test-utils'
import { BlogHeader } from '../blog-header'

vi.mock('@/shared', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

describe('BlogHeader Component', () => {
  it('renders correctly', () => {
    render(<BlogHeader />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByAltText('Logo')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('backToPortfolio')).toBeInTheDocument()
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })
})
