import { render, screen } from '@/tests/test-utils'
import { UserPreferenceControls } from '../user-preference-controls'

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

describe('UserPreferenceControls', () => {
  it('separates language from appearance controls inside the theme provider', () => {
    render(<UserPreferenceControls />)

    const provider = screen.getByTestId('theme-provider')
    const language = screen.getByTestId('language-preference-controls')
    const appearance = screen.getByTestId('appearance-preference-controls')

    expect(provider).toContainElement(language)
    expect(provider).toContainElement(appearance)
    expect(language).toHaveClass('w-fit', 'shrink-0')
    expect(language).toContainElement(screen.getByRole('button', { name: 'Change language' }))
    expect(appearance).toContainElement(screen.getByRole('button', { name: 'Change color theme' }))
    expect(appearance).toContainElement(screen.getByRole('button', { name: 'Toggle theme' }))
  })

  it('can render only appearance controls for a compact appbar', () => {
    render(<UserPreferenceControls variant="appearance" />)

    expect(screen.queryByTestId('language-preference-controls')).not.toBeInTheDocument()
    expect(screen.getByTestId('appearance-preference-controls')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change color theme' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument()
  })
})
