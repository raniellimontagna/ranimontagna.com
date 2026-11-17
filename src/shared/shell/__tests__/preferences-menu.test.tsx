import { track } from '@/shared/lib/analytics/track'
import { useSeason } from '@/shared/store/use-season/use-season'
import { useTheme } from '@/shared/store/use-theme/use-theme'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { PreferencesMenu } from '../preferences-menu'

const replace = vi.fn()
vi.mock('@/shared/lib/analytics/track', () => ({ track: vi.fn() }))
vi.mock('@/shared/config/i18n/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/blog/x',
}))

const labels = {
  open: 'Preferências',
  language: 'Idioma',
  theme: 'Tema',
  light: 'Claro',
  dark: 'Escuro',
  accent: 'Cor de destaque',
  season: 'Época',
  seasonNames: { natal: 'Natal' },
}

describe('PreferencesMenu', () => {
  beforeEach(() => {
    replace.mockClear()
    window.location.hash = '#a'
  })

  it('keeps the visible language code in the button name (label in name)', () => {
    render(<PreferencesMenu labels={labels} />)
    expect(screen.getByRole('button', { name: /Preferências/ })).toHaveAccessibleName(/\bpt\b/i)
  })

  it('names its button starting with the visible code, from its own content', () => {
    render(<PreferencesMenu labels={labels} />)
    const button = screen.getByRole('button', { name: /Preferências/ })
    expect(button).toHaveAccessibleName(/^pt\b/i)
    expect(button).not.toHaveAttribute('aria-label')
  })

  it('gives its button a 44 px tap target', () => {
    render(<PreferencesMenu labels={labels} />)
    expect(screen.getByRole('button', { name: /Preferências/ }).className).toContain('h-11')
  })

  it('changing language keeps the path and the hash', () => {
    render(<PreferencesMenu labels={labels} />)
    fireEvent.click(screen.getByRole('button', { name: /Preferências/ }))
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(replace).toHaveBeenCalledWith('/blog/x#a', { locale: 'en' })
  })

  it('switches theme and accent through the theme store', () => {
    render(<PreferencesMenu labels={labels} />)
    fireEvent.click(screen.getByRole('button', { name: /Preferências/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Claro' }))
    expect(useTheme.getState().theme).toBe('light')
    fireEvent.click(screen.getByRole('button', { name: 'Ocean' }))
    expect(useTheme.getState().colorTheme).toBe('ocean')
  })

  it('closes on Escape and returns focus to its button', () => {
    render(<PreferencesMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: /Preferências/ })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('button', { name: 'English' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  describe('season switch', () => {
    const setEnabled = vi.fn()

    afterEach(() => {
      setEnabled.mockClear()
      vi.mocked(track).mockClear()
      useSeason.setState({ active: null, current: null })
    })

    it('stays hidden out of season', () => {
      useSeason.setState({ active: null, current: null, setEnabled })
      render(<PreferencesMenu labels={labels} />)
      fireEvent.click(screen.getByRole('button', { name: /Preferências/ }))
      expect(screen.queryByRole('button', { name: 'Natal' })).not.toBeInTheDocument()
    })

    it('turns Christmas off and records it', () => {
      useSeason.setState({ active: 'natal', current: 'natal', setEnabled })
      render(<PreferencesMenu labels={labels} />)
      fireEvent.click(screen.getByRole('button', { name: /Preferências/ }))
      const toggle = screen.getByRole('button', { name: 'Natal' })
      expect(toggle).toHaveAttribute('aria-pressed', 'true')
      fireEvent.click(toggle)
      expect(setEnabled).toHaveBeenCalledWith(false)
      expect(track).toHaveBeenCalledWith('season-off', { season: 'natal' })
    })

    it('turns it back on without recording a turn-off', () => {
      useSeason.setState({ active: null, current: 'natal', setEnabled })
      render(<PreferencesMenu labels={labels} />)
      fireEvent.click(screen.getByRole('button', { name: /Preferências/ }))
      const toggle = screen.getByRole('button', { name: 'Natal' })
      expect(toggle).toHaveAttribute('aria-pressed', 'false')
      fireEvent.click(toggle)
      expect(setEnabled).toHaveBeenCalledWith(true)
      expect(track).not.toHaveBeenCalled()
    })
  })
})
