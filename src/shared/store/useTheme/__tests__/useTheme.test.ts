import { useTheme } from '../useTheme'

describe('useTheme store', () => {
  beforeEach(() => {
    useTheme.setState({ theme: 'dark', mounted: false })
    window.localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
  })

  describe('initial state', () => {
    it('starts with dark theme', () => {
      const { theme } = useTheme.getState()

      expect(theme).toBe('dark')
    })

    it('starts with mounted as false', () => {
      const { mounted } = useTheme.getState()

      expect(mounted).toBe(false)
    })
  })

  describe('setTheme', () => {
    it('sets theme to light', () => {
      const { setTheme } = useTheme.getState()

      setTheme('light')

      expect(useTheme.getState().theme).toBe('light')
    })

    it('sets theme to dark', () => {
      useTheme.setState({ theme: 'light' })
      const { setTheme } = useTheme.getState()

      setTheme('dark')

      expect(useTheme.getState().theme).toBe('dark')
    })

    it('applies light class to document', () => {
      const { setTheme } = useTheme.getState()

      setTheme('light')

      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('applies dark class to document', () => {
      const { setTheme } = useTheme.getState()

      setTheme('dark')

      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })
  })

  describe('toggleTheme', () => {
    it('toggles from dark to light', () => {
      useTheme.setState({ theme: 'dark' })
      const { toggleTheme } = useTheme.getState()

      toggleTheme()

      expect(useTheme.getState().theme).toBe('light')
    })

    it('toggles from light to dark', () => {
      useTheme.setState({ theme: 'light' })
      const { toggleTheme } = useTheme.getState()

      toggleTheme()

      expect(useTheme.getState().theme).toBe('dark')
    })

    it('applies correct class after toggle', () => {
      useTheme.setState({ theme: 'dark' })
      const { toggleTheme } = useTheme.getState()

      toggleTheme()

      expect(document.documentElement.classList.contains('light')).toBe(true)
    })
  })

  describe('initTheme', () => {
    it('sets mounted to true', () => {
      const { initTheme } = useTheme.getState()

      initTheme()

      expect(useTheme.getState().mounted).toBe(true)
    })

    it('does not reinitialize if already mounted', () => {
      useTheme.setState({ mounted: true, theme: 'light' })
      const { initTheme } = useTheme.getState()

      initTheme()

      // Should keep the existing theme
      expect(useTheme.getState().theme).toBe('light')
    })

    it('loads theme from localStorage if available', () => {
      window.localStorage.setItem('theme-storage', JSON.stringify({ state: { theme: 'light' } }))
      const { initTheme } = useTheme.getState()

      initTheme()

      expect(useTheme.getState().theme).toBe('light')
    })

    it('defaults to dark if no saved theme', () => {
      const { initTheme } = useTheme.getState()

      initTheme()

      expect(useTheme.getState().theme).toBe('dark')
    })

    it('defaults to dark if localStorage has invalid JSON', () => {
      window.localStorage.setItem('theme-storage', 'invalid-json')
      const { initTheme } = useTheme.getState()

      initTheme()

      expect(useTheme.getState().theme).toBe('dark')
    })

    it('defaults to dark if localStorage has theme but no state.theme', () => {
      window.localStorage.setItem('theme-storage', JSON.stringify({ state: {} }))
      const { initTheme } = useTheme.getState()

      initTheme()

      expect(useTheme.getState().theme).toBe('dark')
    })
  })

  describe('SSR scenarios', () => {
    it('handles applyTheme when document is undefined', () => {
      const originalDocument = global.document
      // biome-ignore lint/suspicious/noExplicitAny: Testing SSR scenario
      ;(global as any).document = undefined

      const { setTheme } = useTheme.getState()
      // Should not throw error
      expect(() => setTheme('light')).not.toThrow()

      global.document = originalDocument
    })

    it('handles initTheme when window is undefined', () => {
      const originalWindow = global.window
      // biome-ignore lint/suspicious/noExplicitAny: Testing SSR scenario
      ;(global as any).window = undefined

      const { initTheme } = useTheme.getState()
      // Should not throw error and not change state
      expect(() => initTheme()).not.toThrow()

      global.window = originalWindow
    })
  })
})
