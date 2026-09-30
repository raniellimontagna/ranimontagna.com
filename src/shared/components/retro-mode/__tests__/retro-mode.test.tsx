import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { THEME_INIT_SCRIPT } from '@/app/[locale]/theme-init-script'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { RetroExperience, RetroTrigger } from '../retro-mode'
import { RetroSecret } from '../retro-secret'

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  sessionStorage.clear()
  document.documentElement.className = 'dark'
  document.documentElement.setAttribute('data-color-theme', 'ocean')
  useRetroMode.getState().setActive(false)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('activates the whole-site mode and returns without changing modern theme preferences', () => {
  render(
    <>
      <RetroTrigger label="Restaurar backup de 1998" />
      <RetroExperience locale="pt" />
    </>,
  )
  const trigger = screen.getByRole('button', { name: 'Restaurar backup de 1998' })
  trigger.focus()
  fireEvent.click(trigger)
  expect(document.documentElement).toHaveAttribute('data-retro', 'true')
  expect(sessionStorage.getItem('retro-mode')).toBe('true')
  const exit = screen.getByRole('button', { name: 'Voltar ao futuro' })
  expect(exit).toHaveFocus()
  fireEvent.click(exit)
  expect(document.documentElement).not.toHaveAttribute('data-retro')
  expect(document.documentElement).toHaveClass('dark')
  expect(document.documentElement).toHaveAttribute('data-color-theme', 'ocean')
  expect(trigger).toHaveFocus()
  expect(sessionStorage.getItem('retro-mode')).toBeNull()
})

it('restores the mode when the shared shell mounts after navigation', () => {
  sessionStorage.setItem('retro-mode', 'true')
  render(<RetroExperience locale="en" />)
  expect(document.documentElement).toHaveAttribute('data-retro', 'true')
  expect(screen.getByRole('button', { name: 'Back to the future' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
})

it('still activates and exits when browser storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  render(
    <>
      <RetroTrigger label="Restore" />
      <RetroExperience locale="es" />
    </>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Restore' }))
  expect(document.documentElement).toHaveAttribute('data-retro', 'true')
  fireEvent.click(screen.getByRole('button', { name: 'Volver al futuro' }))
  expect(document.documentElement).not.toHaveAttribute('data-retro')
})

it('restores the session attribute before hydration, independently of theme storage errors', () => {
  sessionStorage.setItem('retro-mode', 'true')
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key) {
    if (this === localStorage) throw new Error('blocked')
    return key === 'retro-mode' ? 'true' : null
  })
  new Function(THEME_INIT_SCRIPT)()
  expect(document.documentElement).toHaveAttribute('data-retro', 'true')
})

it('retains active mode across client shell remounts', () => {
  const shell = render(<RetroExperience locale="pt" />)
  act(() => useRetroMode.getState().setActive(true))
  shell.unmount()
  render(<RetroExperience locale="es" />)
  expect(document.documentElement).toHaveAttribute('data-retro', 'true')
  expect(screen.getByRole('button', { name: 'Volver al futuro' })).toBeInTheDocument()
})

it('switches universes and returns focus to the original secret icon', async () => {
  render(
    <>
      <RetroSecret mode="xp" />
      <RetroTrigger label="1998" />
      <RetroExperience locale="pt" />
    </>,
  )
  const trigger = screen.getByRole('button', { name: 'Entrar no Windows XP' })
  trigger.focus()
  fireEvent.click(trigger)
  await screen.findByRole('button', { name: 'Iniciar' })
  expect(document.documentElement).toHaveAttribute('data-retro-mode', 'xp')
  expect(screen.getByRole('button', { name: 'Voltar ao futuro' })).toHaveFocus()
  fireEvent.click(screen.getByRole('button', { name: '1998' }))
  expect(document.documentElement).toHaveAttribute('data-retro-mode', '1998')
  fireEvent.click(screen.getByRole('button', { name: 'Voltar ao futuro' }))
  expect(trigger).toHaveFocus()
  expect(document.documentElement).not.toHaveAttribute('data-retro-mode')
  fireEvent.click(trigger)
  await screen.findByRole('button', { name: 'Iniciar' })
  fireEvent.click(screen.getByRole('button', { name: 'Voltar ao futuro' }))
  expect(trigger).toHaveFocus()
})

it.each(['xp', 'dos', 'gameboy', 'newspaper', 'ide', 'mac'])(
  'restores %s before hydration',
  (mode) => {
    sessionStorage.setItem('retro-mode', mode)
    new Function(THEME_INIT_SCRIPT)()
    expect(document.documentElement).toHaveAttribute('data-retro-mode', mode)
  },
)
