import { fireEvent, render, screen } from '@/tests/test-utils'
import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'
import { HomeHeaderControls } from '../home-header-controls'

vi.mock('@/shared/components/theme-provider/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}))

vi.mock('@/shared/components/language-switcher/language-switcher', () => ({
  LanguageSwitcher: () => (
    <button type="button" aria-label="Change language">
      Language
    </button>
  ),
}))

vi.mock('@/shared/components/color-theme-picker/color-theme-picker', () => ({
  ColorThemePicker: () => (
    <button type="button" aria-label="Change color theme">
      Color
    </button>
  ),
}))

vi.mock('@/shared/components/theme-toggle/theme-toggle', () => ({
  ThemeToggle: () => (
    <button type="button" aria-label="Toggle theme">
      Theme
    </button>
  ),
}))

describe('HomeHeaderControls', () => {
  beforeEach(() => {
    useCommandMenu.setState({ isOpen: false })
  })

  it('renders command, language, color, and theme controls', () => {
    render(<HomeHeaderControls />)

    expect(screen.getByRole('button', { name: /open command palette/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /change language/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /change color theme/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('opens the lazy command menu from the top bar button', () => {
    render(<HomeHeaderControls />)

    fireEvent.click(screen.getByRole('button', { name: /open command palette/i }))

    expect(useCommandMenu.getState().isOpen).toBe(true)
  })
})
