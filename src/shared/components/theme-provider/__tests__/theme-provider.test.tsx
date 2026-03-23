import type { ThemeStore } from '@/shared/store/use-theme/use-theme.types'
import { render, waitFor } from '@/tests/test-utils'
import { ThemeProvider } from '../theme-provider'

const mockInitTheme = vi.fn()
let mockThemeState: ThemeStore

vi.mock('@/shared/store/use-theme/use-theme', () => ({
  useTheme: <T,>(selector: (state: ThemeStore) => T) => {
    return selector(mockThemeState)
  },
}))

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockInitTheme.mockReset()
    document.documentElement.className = ''
    document.documentElement.style.colorScheme = ''
    document.documentElement.removeAttribute('data-color-theme')

    mockThemeState = {
      theme: 'dark',
      colorTheme: 'default',
      mounted: false,
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      setColorTheme: vi.fn(),
      initTheme: mockInitTheme,
    }
  })

  it('initializes theme on mount and renders children', () => {
    render(
      <ThemeProvider>
        <div>Child</div>
      </ThemeProvider>,
    )

    expect(mockInitTheme).toHaveBeenCalled()
    expect(document.documentElement).not.toHaveClass('light')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('applies the active theme and custom color theme to the document when mounted', async () => {
    mockThemeState = {
      ...mockThemeState,
      theme: 'light',
      colorTheme: 'ocean',
      mounted: true,
    }

    const { getByText } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>,
    )

    expect(getByText('Test Child')).toBeInTheDocument()

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('light')
    })

    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(document.documentElement).toHaveAttribute('data-color-theme', 'ocean')
  })

  it('removes a custom color theme attribute when the default theme is active', async () => {
    document.documentElement.setAttribute('data-color-theme', 'rose')

    mockThemeState = {
      ...mockThemeState,
      theme: 'dark',
      colorTheme: 'default',
      mounted: true,
    }

    render(
      <ThemeProvider>
        <div>Another Child</div>
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
    })

    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.documentElement).not.toHaveAttribute('data-color-theme')
  })
})
