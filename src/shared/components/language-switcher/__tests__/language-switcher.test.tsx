import { fireEvent, render, screen } from '@/tests/test-utils'
import { LanguageSwitcher } from '../language-switcher'

// Mocks
const mockReplace = vi.fn()
const mockUsePathname = vi.fn()
const mockUseLocale = vi.fn()

vi.mock('@/shared/config/i18n/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('next/image', () => ({
  // biome-ignore lint/performance/noImgElement: Mock component
  // biome-ignore lint/a11y/useAltText: Mock component
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

vi.mock('next-intl', () => ({
  useLocale: () => mockUseLocale(),
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/shared/config/i18n/routing', () => ({
  locales: [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
  ],
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockUseLocale.mockReturnValue('en')
    // next-intl's usePathname returns path WITHOUT locale prefix
    mockUsePathname.mockReturnValue('/about')
    mockReplace.mockClear()
  })

  it('renders correctly with current locale flag', () => {
    render(<LanguageSwitcher />)
    const button = screen.getByRole('button', { name: /Change language/i })
    expect(button).toBeInTheDocument()
    // Check if flag image is present (by alt text)
    expect(screen.getByAltText('en flag')).toBeInTheDocument()
  })

  it('opens menu on click', () => {
    render(<LanguageSwitcher />)
    const button = screen.getByRole('button', { name: /Change language/i })

    fireEvent.click(button)

    expect(screen.getByText('Select Language')).toBeInTheDocument()
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Português')).toBeInTheDocument()
  })

  it('closes menu on click outside', () => {
    render(<LanguageSwitcher />)
    const button = screen.getByRole('button', { name: /Change language/i })
    fireEvent.click(button)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes menu on Escape key', () => {
    render(<LanguageSwitcher />)
    fireEvent.click(screen.getByRole('button', { name: /Change language/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('navigates to new locale on selection using router.replace', () => {
    mockUsePathname.mockReturnValue('/about') // Path WITHOUT locale prefix (next-intl behaviour)

    render(<LanguageSwitcher />)
    fireEvent.click(screen.getByRole('button', { name: /Change language/i }))

    const ptButton = screen.getByRole('menuitem', { name: /Change language to Português/i })
    fireEvent.click(ptButton)

    // next-intl router.replace handles locale prefix logic internally
    expect(mockReplace).toHaveBeenCalledWith('/about', { locale: 'pt' })
  })

  it('closes menu when overlay is clicked', () => {
    render(<LanguageSwitcher />)
    fireEvent.click(screen.getByRole('button', { name: /Change language/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    // Click the overlay (backdrop)
    const overlay = screen.getByLabelText('Close language menu')
    fireEvent.click(overlay)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
