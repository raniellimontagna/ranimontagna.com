import { THEME_INIT_SCRIPT } from '../theme-init-script'

const runThemeInitScript = () => {
  Function(THEME_INIT_SCRIPT)()
}

describe('locale head theme init script', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = 'dark'
    document.documentElement.style.colorScheme = ''
    document.documentElement.removeAttribute('data-color-theme')
  })

  it('applies the saved color theme before the client provider mounts', () => {
    window.localStorage.setItem(
      'theme-storage',
      JSON.stringify({ state: { theme: 'dark', colorTheme: 'rose' } }),
    )

    runThemeInitScript()

    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-color-theme', 'rose')
  })
})
