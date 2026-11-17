import { seasonOn } from '@/shared/lib/seasons/seasons'
import { THEME_INIT_SCRIPT } from '../theme-init-script'

const runThemeInitScript = () => {
  Function(THEME_INIT_SCRIPT)()
}

const root = document.documentElement
const visit = (path: string) => window.history.replaceState(null, '', path)
const today = (month: number, day: number, hour = 12, minute = 0) =>
  vi.setSystemTime(new Date(2026, month - 1, day, hour, minute))

describe('locale head theme init script', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    root.className = 'dark'
    root.style.colorScheme = ''
    root.removeAttribute('data-color-theme')
    root.removeAttribute('data-season')
    root.removeAttribute('data-retro')
    root.removeAttribute('data-retro-mode')
    visit('/')
  })

  it('applies the saved color theme before the client provider mounts', () => {
    window.localStorage.setItem(
      'theme-storage',
      JSON.stringify({ state: { theme: 'dark', colorTheme: 'rose' } }),
    )

    runThemeInitScript()

    expect(root).toHaveClass('dark')
    expect(root.style.colorScheme).toBe('dark')
    expect(root).toHaveAttribute('data-color-theme', 'rose')
  })
})

describe('locale head season', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    window.localStorage.clear()
    window.sessionStorage.clear()
    root.removeAttribute('data-season')
    root.removeAttribute('data-retro')
    root.removeAttribute('data-retro-mode')
    visit('/')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('dresses the page for Christmas in December', () => {
    today(12, 10)
    runThemeInitScript()
    expect(root).toHaveAttribute('data-season', 'natal')
  })

  it('respects a visitor who turned Christmas off this year', () => {
    today(12, 10)
    window.localStorage.setItem('season-off:natal-2026', '1')
    runThemeInitScript()
    expect(root).not.toHaveAttribute('data-season')
  })

  it('hides the season for the tab with ?epoca=off', () => {
    today(12, 10)
    visit('/?epoca=off')
    runThemeInitScript()
    expect(root).not.toHaveAttribute('data-season')
    expect(window.sessionStorage.getItem('season-preview')).toBe('off')
  })

  it('previews Christmas before December and keeps it for the tab', () => {
    today(11, 15)
    visit('/?epoca=natal')
    runThemeInitScript()
    expect(root).toHaveAttribute('data-season', 'natal')

    root.removeAttribute('data-season')
    visit('/blog')
    runThemeInitScript()
    expect(root).toHaveAttribute('data-season', 'natal')
  })

  it('lets a preview win over a saved turn-off', () => {
    today(11, 15)
    window.localStorage.setItem('season-off:natal-2026', '1')
    visit('/?epoca=natal')
    runThemeInitScript()
    expect(root).toHaveAttribute('data-season', 'natal')
  })

  it('stays out of the way of a retro world', () => {
    today(12, 10)
    window.sessionStorage.setItem('retro-mode', 'xp')
    runThemeInitScript()
    expect(root).toHaveAttribute('data-retro', 'true')
    expect(root).not.toHaveAttribute('data-season')
  })

  it('still follows the date when storage is blocked', () => {
    today(12, 10)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(runThemeInitScript).not.toThrow()
    expect(root).toHaveAttribute('data-season', 'natal')
  })

  it.each([
    [11, 30, 23, 59],
    [12, 1, 0, 0],
    [12, 26, 23, 59],
    [12, 27, 0, 0],
    [7, 15, 12, 0],
  ])('agrees with seasonOn on %i/%i %i:%i', (month, day, hour, minute) => {
    today(month, day, hour, minute)
    runThemeInitScript()
    const expected = seasonOn(new Date(2026, month - 1, day, hour, minute))
    expect(root.getAttribute('data-season')).toBe(expected)
  })
})
