import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { HomeHeaderControls } from '../home-header-controls'

const props = {
  resumeLink: { href: '/resume.pdf', filename: 'resume.pdf', name: 'Resume' },
  labels: { command: 'Open command palette', more: 'More options' },
}

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
    render(<HomeHeaderControls {...props} />)

    expect(screen.getByRole('button', { name: /open command palette/i })).toBeInTheDocument()
    const disclosure = screen.getByRole('button', { name: /more options/i })
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    expect(disclosure).toHaveAttribute('aria-controls', 'home-header-secondary-controls')
    expect(disclosure).toHaveClass('h-10', 'w-10', 'sm:hidden')
    expect(screen.getByTestId('desktop-home-preferences')).toHaveClass('hidden', 'sm:flex')
    expect(screen.queryByTestId('compact-home-preferences')).not.toBeInTheDocument()

    fireEvent.click(disclosure)

    expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('compact-home-preferences')).toBeInTheDocument()
    expect(screen.getByTestId('compact-home-preferences')).toHaveClass('sm:hidden')
    expect(screen.getAllByRole('button', { name: /change language/i })).not.toHaveLength(0)
    expect(screen.getAllByRole('button', { name: /change color theme/i })).not.toHaveLength(0)
    expect(screen.getAllByRole('button', { name: /toggle theme/i })).not.toHaveLength(0)
    expect(screen.getAllByRole('link', { name: 'Resume' })).toHaveLength(2)
    for (const link of screen.getAllByRole('link', { name: 'Resume' })) {
      expect(link).toHaveAttribute('href', '/resume.pdf')
    }
  })

  it('opens the lazy command menu from the top bar button', () => {
    render(<HomeHeaderControls {...props} />)

    fireEvent.click(screen.getByRole('button', { name: /open command palette/i }))

    expect(useCommandMenu.getState().isOpen).toBe(true)
  })

  it('closes compact options with Escape and restores disclosure focus', () => {
    render(<HomeHeaderControls {...props} />)
    const disclosure = screen.getByRole('button', { name: /more options/i })

    fireEvent.click(disclosure)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByTestId('compact-home-preferences')).not.toBeInTheDocument()
    expect(disclosure).toHaveFocus()
  })
})
