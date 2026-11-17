import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { GameBoyWorld } from '../gameboy-world'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('@/shared/config/i18n/navigation', () => ({
  useRouter: () => ({ push }),
}))

afterEach(() => {
  cleanup()
  push.mockClear()
  vi.useRealTimers()
  vi.restoreAllMocks()
  sessionStorage.clear()
  localStorage.clear()
})

it.each([
  ['pt', 'Sobre mim', 'Projetos', 'Contato'],
  ['en', 'About me', 'Projects', 'Contact'],
  ['es', 'Sobre mí', 'Proyectos', 'Contacto'],
])('localizes the real navigation menu in %s', (locale, about, projects, contact) => {
  render(<GameBoyWorld locale={locale} onExit={vi.fn()} />)
  expect(screen.getByRole('button', { name: about })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: projects })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Blog' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: contact })).toBeInTheDocument()
})

it('wraps selection in both directions with the D-pad', () => {
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Previous item' }))
  expect(screen.getByRole('button', { name: 'Contact' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(screen.getByRole('button', { name: 'Next item' }))
  expect(screen.getByRole('button', { name: 'About me' })).toHaveAttribute('aria-pressed', 'true')
})

it.each([
  ['About me', '/#about'],
  ['Projects', '/projects'],
  ['Blog', '/blog'],
  ['Contact', '/#contact'],
])('opens %s through its fixed internal route with A', (label, href) => {
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: label }))
  fireEvent.click(screen.getByRole('button', { name: 'A — Open selection' }))
  expect(push).toHaveBeenCalledExactlyOnceWith(href)
})

it('returns to the first menu selection with B after opening a page', () => {
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Blog' }))
  fireEvent.click(screen.getByRole('button', { name: 'A — Open selection' }))
  expect(screen.getByRole('status')).toHaveTextContent('Opening: Blog')
  fireEvent.click(screen.getByRole('button', { name: 'B — Return to menu' }))
  expect(screen.getByRole('button', { name: 'About me' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('status')).toHaveTextContent('Choose a page')
  expect(push).toHaveBeenCalledTimes(1)
})

it('handles arrows, Enter and Escape while focus is inside the console', () => {
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  const control = screen.getByRole('button', { name: 'About me' })
  control.focus()
  fireEvent.keyDown(control, { key: 'ArrowRight' })
  expect(screen.getByRole('button', { name: 'Projects' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.keyDown(control, { key: 'Enter' })
  expect(push).toHaveBeenCalledExactlyOnceWith('/projects')
  fireEvent.keyDown(control, { key: 'Escape' })
  expect(screen.getByRole('button', { name: 'About me' })).toHaveAttribute('aria-pressed', 'true')
})

it.each([
  ['Previous item', 'Contact'],
  ['Select to the left', 'Contact'],
  ['Next item', 'Projects'],
  ['Select to the right', 'Projects'],
])('leaves Enter on %s to the native selection action', (label, selected) => {
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  const control = screen.getByRole('button', { name: label })
  control.focus()
  expect(fireEvent.keyDown(control, { key: 'Enter' })).toBe(true)
  expect(push).not.toHaveBeenCalled()
  // jsdom does not synthesize the native button click after an uncancelled Enter.
  fireEvent.click(control)
  expect(screen.getByRole('button', { name: selected })).toHaveAttribute('aria-pressed', 'true')
  expect(push).not.toHaveBeenCalled()
})

it('leaves Enter on B to the native return action', () => {
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Blog' }))
  const control = screen.getByRole('button', { name: 'B — Return to menu' })
  control.focus()
  expect(fireEvent.keyDown(control, { key: 'Enter' })).toBe(true)
  expect(push).not.toHaveBeenCalled()
  fireEvent.click(control)
  expect(screen.getByRole('button', { name: 'About me' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('status')).toHaveTextContent('Choose a page')
})

it('leaves Enter on A to the native open action', () => {
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Blog' }))
  const control = screen.getByRole('button', { name: 'A — Open selection' })
  control.focus()
  expect(fireEvent.keyDown(control, { key: 'Enter' })).toBe(true)
  expect(push).not.toHaveBeenCalled()
  fireEvent.click(control)
  expect(push).toHaveBeenCalledExactlyOnceWith('/blog')
})

it.each([
  ['a', 'b'],
  ['A', 'B'],
])('opens with %s and returns with %s while focus is inside the console', (open, back) => {
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Projects' }))
  const control = screen.getByRole('button', { name: 'Next item' })
  control.focus()
  expect(fireEvent.keyDown(control, { key: open })).toBe(false)
  expect(push).toHaveBeenCalledExactlyOnceWith('/projects')
  expect(fireEvent.keyDown(control, { key: back })).toBe(false)
  expect(screen.getByRole('button', { name: 'About me' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('status')).toHaveTextContent('Choose a page')
  expect(push).toHaveBeenCalledTimes(1)
})

it('leaves console shortcuts in the contact form untouched', () => {
  render(
    <>
      <GameBoyWorld locale="en" onExit={vi.fn()} />
      <label>
        Contact message
        <textarea />
      </label>
    </>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Blog' }))
  const message = screen.getByRole('textbox', { name: 'Contact message' })
  message.focus()
  for (const key of ['ArrowDown', 'ArrowLeft', 'Enter', 'Escape', 'a', 'A', 'b', 'B']) {
    expect(fireEvent.keyDown(message, { key })).toBe(true)
  }
  expect(screen.getByRole('button', { name: 'Blog' })).toHaveAttribute('aria-pressed', 'true')
  expect(push).not.toHaveBeenCalled()
})

it('plays Bug Hunt from START: catch a bug, run out the clock, keep the record', () => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Start — play Bug Hunt' }))
  expect(screen.queryByRole('navigation', { name: 'Game Boy menu' })).not.toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Bug Hunt. Bugs: 0.')

  // The first bug spawns right next to the player; the keyboard works from anywhere.
  fireEvent.keyDown(document.body, { key: 'ArrowRight' })
  expect(screen.getByRole('status')).toHaveTextContent('Bug Hunt. Bugs: 1.')

  act(() => vi.advanceTimersByTime(31_000))
  expect(screen.getByRole('status')).toHaveTextContent(/Game over\. You caught \d+ bugs/)
  expect(Number(localStorage.getItem('retro-gameboy-best'))).toBeGreaterThanOrEqual(1)

  fireEvent.click(screen.getByRole('button', { name: 'B — Return to menu' }))
  expect(screen.getByRole('navigation', { name: 'Game Boy menu' })).toBeInTheDocument()
})

it('changes the screen colors with SELECT and powers off and on', () => {
  render(<GameBoyWorld locale="pt" onExit={vi.fn()} />)
  const lcd = document.querySelector('.gameboy-screen')
  expect(lcd).toHaveAttribute('data-palette', 'dmg')
  fireEvent.click(screen.getByRole('button', { name: 'Select — trocar as cores da tela' }))
  expect(lcd).toHaveAttribute('data-palette', 'pocket')
  expect(sessionStorage.getItem('retro-gameboy-palette')).toBe('pocket')

  const power = screen.getByRole('button', { name: 'Liga e desliga' })
  fireEvent.click(power)
  expect(power).toHaveAttribute('aria-pressed', 'false')
  expect(screen.queryByRole('navigation', { name: 'Menu Game Boy' })).not.toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Desligado')
  fireEvent.click(screen.getByRole('button', { name: 'Próximo item' }))
  fireEvent.click(power)
  expect(screen.getByRole('button', { name: 'Sobre mim' })).toHaveAttribute('aria-pressed', 'true')
})

it('maps X and Z to A and B inside the console', () => {
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Blog' }))
  const control = screen.getByRole('button', { name: 'Blog' })
  expect(fireEvent.keyDown(control, { key: 'x' })).toBe(false)
  expect(push).toHaveBeenCalledExactlyOnceWith('/blog')
  fireEvent.keyDown(control, { key: 'z' })
  expect(screen.getByRole('button', { name: 'About me' })).toHaveAttribute('aria-pressed', 'true')
})

// Turns reduced motion off, so it runs last.
it('boots with the logo once per session', () => {
  mockMatchMedia({})
  vi.useFakeTimers()
  const first = render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  expect(document.querySelector('.gameboy-boot-logo')).toHaveTextContent('RANI BOY')
  expect(screen.queryByRole('navigation', { name: 'Game Boy menu' })).not.toBeInTheDocument()
  act(() => vi.advanceTimersByTime(2800))
  expect(screen.getByRole('navigation', { name: 'Game Boy menu' })).toBeInTheDocument()
  first.unmount()
  render(<GameBoyWorld locale="en" onExit={vi.fn()} />)
  expect(screen.getByRole('navigation', { name: 'Game Boy menu' })).toBeInTheDocument()
})

it('pauses with START and plays again with A after the clock runs out', () => {
  sessionStorage.setItem('retro-booted-gameboy', '1')
  vi.useFakeTimers()
  render(<GameBoyWorld locale="pt" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Start — jogar Caça-bugs' }))
  fireEvent.keyDown(document.body, { key: 'p' })
  expect(document.querySelector('.gameboy-game-overlay')).toHaveTextContent('PAUSA')
  fireEvent.keyDown(document.body, { key: 'ArrowUp' })
  fireEvent.click(screen.getByRole('button', { name: 'Start — jogar Caça-bugs' }))
  expect(document.querySelector('.gameboy-game-overlay')).toBeNull()
  for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'x'])
    fireEvent.keyDown(document.body, { key })
  act(() => vi.advanceTimersByTime(31_000))
  expect(document.querySelector('.gameboy-game-overlay')).toHaveTextContent('FIM DE JOGO')
  fireEvent.keyDown(document.body, { key: 'Enter' })
  expect(document.querySelector('.gameboy-game-overlay')).toBeNull()
  fireEvent.keyDown(document.body, { key: 'Escape' })
  expect(screen.getByRole('navigation', { name: 'Menu Game Boy' })).toBeInTheDocument()
})
