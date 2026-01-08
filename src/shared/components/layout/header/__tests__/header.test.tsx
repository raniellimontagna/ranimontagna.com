import { usePathname } from 'next/navigation'
import type { Mock } from 'vitest'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { Header } from '../header'

// Mocks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

vi.mock('@/shared', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}))

vi.mock('@/shared/store/useCommandMenu/useCommandMenu', () => ({
  useCommandMenu: () => ({
    setOpen: vi.fn(),
  }),
}))

vi.mock('@/shared/store/useTheme/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    mounted: true,
  }),
}))

describe('Header Component', () => {
  beforeEach(() => {
    ;(usePathname as Mock).mockReturnValue('/')
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    window.scrollTo = vi.fn()
  })

  it('renders correctly', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByAltText('Logo')).toBeInTheDocument()

    // Navigation items appear in both desktop and mobile menus
    // getAllByText returns an array, we just want to ensure at least one is present/visible
    expect(screen.getAllByText('navigation.about')[0]).toBeInTheDocument()

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('scrolled state adds background', () => {
    render(<Header />)
    const header = screen.getByRole('banner')

    fireEvent.scroll(window, { target: { scrollY: 100 } })
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    fireEvent.scroll(window)

    expect(header).toHaveClass('bg-white/70')
  })
})
