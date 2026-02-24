import { usePathname, useRouter } from 'next/navigation'
import type { Mock } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { Header } from '../header'

const mockPush = vi.fn()
const mockSetOpen = vi.fn()

// Mocks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

vi.mock('@/shared/components/language-switcher/language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}))

vi.mock('@/shared/components/theme-toggle/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}))

vi.mock('@/shared/store/use-command-menu/use-command-menu', () => ({
  useCommandMenu: () => ({
    setOpen: mockSetOpen,
  }),
}))

vi.mock('@/shared/store/use-theme/use-theme', () => ({
  useTheme: () => ({
    theme: 'light',
    mounted: true,
  }),
}))

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // biome-ignore lint/a11y/useAltText: Mock component
    // biome-ignore lint/performance/noImgElement: Mock component
    <img {...props} />
  ),
}))

describe('Header Component', () => {
  beforeEach(() => {
    ;(usePathname as Mock).mockReturnValue('/en')
    ;(useRouter as Mock).mockReturnValue({ push: mockPush })
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    window.scrollTo = vi.fn()
    document.getElementById = vi.fn()
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByAltText('Logo')).toBeInTheDocument()
    expect(screen.getAllByText('navigation.about')[0]).toBeInTheDocument()
  })

  it('scrolled state adds background', async () => {
    render(<Header />)
    const header = screen.getByRole('banner')

    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(header).toHaveClass('bg-white/70')
    })
  })

  it('opens mobile menu when hamburger clicked', () => {
    render(<Header />)
    const menuButton = screen.getByLabelText('mobileMenu.toggleAriaLabel')

    fireEvent.click(menuButton)

    // Mobile menu should be visible
    const mobileNav = screen.getAllByText('navigation.about')[1] // Second one is in mobile menu
    expect(mobileNav).toBeInTheDocument()
  })

  it('scrolls to section when navigation item clicked on home page', () => {
    ;(usePathname as Mock).mockReturnValue('/en')
    const mockElement = {
      scrollIntoView: vi.fn(),
    }
    document.getElementById = vi.fn(() => mockElement as unknown as HTMLElement)

    render(<Header />)

    // Click on "About" navigation button (desktop)
    const aboutButtons = screen.getAllByText('navigation.about')
    const desktopAboutButton = aboutButtons[0]

    fireEvent.click(desktopAboutButton)

    expect(document.getElementById).toHaveBeenCalledWith('about')
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
  })

  it('scrolls to top when logo clicked', () => {
    render(<Header />)
    const logoButton = screen.getByLabelText('logo.ariaLabel')

    fireEvent.click(logoButton)

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('navigates to home with hash when scroll link clicked from non-home page', () => {
    ;(usePathname as Mock).mockReturnValue('/en/blog')
    ;(useRouter as Mock).mockReturnValue({ push: mockPush })

    const { rerender } = render(<Header />)
    rerender(<Header />)

    // On non-home page, scroll items should be links
    const aboutLinks = screen.getAllByText('navigation.about')
    const desktopAboutLink = aboutLinks[0].closest('a')

    expect(desktopAboutLink).toHaveAttribute('href', '/en#about')
  })

  it('renders link for blog navigation item', () => {
    render(<Header />)

    const blogLinks = screen.getAllByText('navigation.blog')
    expect(blogLinks[0].closest('a')).toHaveAttribute('href', '/en/blog')
  })

  it('opens command menu when shortcut button clicked', () => {
    render(<Header />)

    const commandButton = screen.getByText('⌘K').closest('button')
    if (commandButton) {
      fireEvent.click(commandButton)
      expect(mockSetOpen).toHaveBeenCalledWith(true)
    }
  })

  it('closes mobile menu when navigation item clicked', () => {
    render(<Header />)

    // Open mobile menu
    const menuButton = screen.getByLabelText('mobileMenu.toggleAriaLabel')
    fireEvent.click(menuButton)

    // Click a mobile navigation item
    const mobileAbout = screen.getAllByText('navigation.about')[1]
    fireEvent.click(mobileAbout)

    // Menu should close (check that max-h-0 class is applied)
    const mobileMenuContainer = mobileAbout.closest('div')?.parentElement
    expect(mobileMenuContainer).toHaveClass('max-h-0')
  })

  it('handles scroll event listener cleanup', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Header />)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('handles missing section element gracefully', () => {
    document.getElementById = vi.fn(() => null)

    render(<Header />)

    const aboutButtons = screen.getAllByText('navigation.about')
    fireEvent.click(aboutButtons[0])

    // Should not throw error
    expect(document.getElementById).toHaveBeenCalledWith('about')
  })
})
