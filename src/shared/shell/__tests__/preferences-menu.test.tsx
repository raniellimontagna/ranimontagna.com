import { useTheme } from '@/shared/store/use-theme/use-theme'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { PreferencesMenu } from '../preferences-menu'

const replace = vi.fn()
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
}

describe('PreferencesMenu', () => {
  beforeEach(() => {
    replace.mockClear()
    window.location.hash = '#a'
  })

  it('changing language keeps the path and the hash', () => {
    render(<PreferencesMenu labels={labels} />)
    fireEvent.click(screen.getByRole('button', { name: 'Preferências' }))
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(replace).toHaveBeenCalledWith('/blog/x#a', { locale: 'en' })
  })

  it('switches theme and accent through the theme store', () => {
    render(<PreferencesMenu labels={labels} />)
    fireEvent.click(screen.getByRole('button', { name: 'Preferências' }))
    fireEvent.click(screen.getByRole('button', { name: 'Claro' }))
    expect(useTheme.getState().theme).toBe('light')
    fireEvent.click(screen.getByRole('button', { name: 'Ocean' }))
    expect(useTheme.getState().colorTheme).toBe('ocean')
  })

  it('closes on Escape and returns focus to its button', () => {
    render(<PreferencesMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Preferências' })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('button', { name: 'English' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
