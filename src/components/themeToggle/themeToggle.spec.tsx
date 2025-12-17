import { fireEvent, render, screen } from '@/tests/functions'
import { ThemeToggle } from './themeToggle'

import { useTheme } from '@/store'

vi.mock('@/store/useTheme/useTheme')
const mockUseTheme = vi.mocked(useTheme)

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string, values: { mode: string }) => {
    return `${key} for ${values.mode} mode`
  }),
  NextIntlProvider: ({ children }: { children: React.ReactNode }) => children,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render a disabled button in its loading state when not mounted', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn(),
      mounted: false,
    })

    render(<ThemeToggle />)

    const button = screen.getByLabelText('Loading theme toggle')
    expect(button).toBeDefined()
    expect(button.querySelector('.h-5.w-5')).toBeDefined()
  })

  it('should render with the sun icon visible for the light theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn(),
      mounted: true,
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'themeToggle.ariaLabel for dark mode')
    expect(button).toHaveAttribute('title', 'themeToggle.tooltip for dark mode')

    const sunIcon = screen.getByTestId('sun-icon')
    const moonIcon = screen.getByTestId('moon-icon')

    expect(sunIcon).toHaveClass('scale-100 rotate-0 opacity-100')
    expect(moonIcon).toHaveClass('scale-0 -rotate-90 opacity-0')
  })

  it('should render with the moon icon visible for the dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: vi.fn(),
      mounted: true,
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'themeToggle.ariaLabel for light mode')
    expect(button).toHaveAttribute('title', 'themeToggle.tooltip for light mode')

    const sunIcon = screen.getByTestId('sun-icon')
    const moonIcon = screen.getByTestId('moon-icon')

    expect(sunIcon).toHaveClass('scale-0 rotate-90 opacity-0')
    expect(moonIcon).toHaveClass('scale-100 rotate-0 opacity-100')
  })

  it('should call toggleTheme function when the button is clicked', () => {
    const mockToggleTheme = vi.fn()
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      mounted: true,
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })
})
