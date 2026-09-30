import { useRetroMode } from '../use-retro-mode'

beforeEach(() => {
  sessionStorage.clear()
  useRetroMode.getState().setActive(false)
})

it('persists the selected universe without overwriting the modern theme', () => {
  document.documentElement.setAttribute('data-color-theme', 'ocean')
  useRetroMode.getState().setMode('xp')
  expect(useRetroMode.getState()).toMatchObject({ mode: 'xp', active: true })
  expect(document.documentElement).toHaveAttribute('data-retro-mode', 'xp')
  expect(sessionStorage.getItem('retro-mode')).toBe('xp')
  useRetroMode.getState().setMode('dos')
  expect(useRetroMode.getState().mode).toBe('dos')
  useRetroMode.getState().setActive(false)
  expect(document.documentElement).not.toHaveAttribute('data-retro-mode')
  expect(document.documentElement).toHaveAttribute('data-color-theme', 'ocean')
})

it.each(['1998', 'xp', 'dos', 'gameboy', 'newspaper', 'ide', 'mac'] as const)(
  'restores %s after a reload',
  (mode) => {
    sessionStorage.setItem('retro-mode', mode)
    useRetroMode.getState().init()
    expect(useRetroMode.getState().mode).toBe(mode)
    expect(document.documentElement).toHaveAttribute('data-retro-mode', mode)
  },
)

it('migrates the published legacy value and rejects unknown modes', () => {
  sessionStorage.setItem('retro-mode', 'true')
  useRetroMode.getState().init()
  expect(useRetroMode.getState().mode).toBe('1998')
  sessionStorage.setItem('retro-mode', 'invalid')
  useRetroMode.getState().init()
  expect(useRetroMode.getState()).toMatchObject({ mode: null, active: false })
  expect(document.documentElement).not.toHaveAttribute('data-retro')
})
