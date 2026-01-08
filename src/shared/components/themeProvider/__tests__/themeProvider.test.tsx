import type { ThemeStore } from '@/shared/store/useTheme/useTheme.types'
import { render } from '@/tests/test-utils'
import { ThemeProvider } from '../themeProvider'

// Mock useTheme
const mockInitTheme = vi.fn()
vi.mock('@/shared/store/useTheme/useTheme', () => ({
  useTheme: <T,>(selector: (state: ThemeStore) => T) => {
    // Mock the selector logic if needed, or just return mock object
    // The component calls useTheme((state) => state.initTheme)
    const state = { initTheme: mockInitTheme } as unknown as ThemeStore
    return selector(state)
  },
}))

describe('ThemeProvider', () => {
  it('initializes theme on mount', () => {
    render(
      <ThemeProvider>
        <div>Child</div>
      </ThemeProvider>,
    )

    expect(mockInitTheme).toHaveBeenCalled()
  })

  it('renders children', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>,
    )
    expect(getByText('Test Child')).toBeInTheDocument()
  })
})
