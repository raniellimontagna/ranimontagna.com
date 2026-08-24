import type { ThemeStore } from '@/shared/store/use-theme/use-theme.types'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { ColorThemePicker } from '../color-theme-picker'

const mockSetColorTheme = vi.fn()

let mockThemeState: Pick<ThemeStore, 'colorTheme' | 'mounted' | 'theme'> & {
  setColorTheme: typeof mockSetColorTheme
}

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      layoutId: _layoutId,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { layoutId?: string } & Record<string, unknown>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

vi.mock('@/shared/store/use-theme/use-theme', () => ({
  useTheme: () => mockThemeState,
}))

describe('ColorThemePicker', () => {
  beforeEach(() => {
    mockSetColorTheme.mockReset()
    mockThemeState = {
      colorTheme: 'default',
      mounted: true,
      setColorTheme: mockSetColorTheme,
      theme: 'light',
    }
  })

  it('renders a placeholder before the theme store is mounted', () => {
    mockThemeState = { ...mockThemeState, mounted: false }

    const { container } = render(<ColorThemePicker />)

    expect(screen.queryByRole('button', { name: /Change color theme/i })).not.toBeInTheDocument()
    expect(container.firstChild).toHaveClass(
      'flex',
      'h-8',
      'w-8',
      'rounded-xl',
      'bg-surface-strong/50',
      'opacity-20',
    )
  })

  it('opens the palette and highlights the active theme using the current mode', () => {
    mockThemeState = { ...mockThemeState, colorTheme: 'rose', theme: 'dark' }

    render(<ColorThemePicker />)
    const trigger = screen.getByRole('button', { name: /Change color theme/i })
    fireEvent.click(trigger)

    expect(screen.getByText('Color theme')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', 'color-theme-options')
    expect(screen.getByRole('group', { name: 'Color theme' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Rose' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Default' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Mono' })).toBeInTheDocument()
  })

  it('selects a theme and closes the palette', () => {
    render(<ColorThemePicker />)
    const trigger = screen.getByRole('button', { name: /Change color theme/i })
    expect(trigger).not.toHaveAttribute('aria-haspopup')
    fireEvent.click(trigger)

    fireEvent.click(screen.getByRole('radio', { name: 'Ocean' }))

    expect(mockSetColorTheme).toHaveBeenCalledWith('ocean')
    expect(screen.queryByText('Color theme')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes the palette on outside click and Escape', () => {
    render(<ColorThemePicker />)
    fireEvent.click(screen.getByRole('button', { name: /Change color theme/i }))
    expect(screen.getByText('Color theme')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('Color theme')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Change color theme/i }))
    expect(screen.getByText('Color theme')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('Color theme')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Change color theme/i })).toHaveFocus()
  })
})
