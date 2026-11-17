import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { Web98World } from '../web98-world'

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
  sessionStorage.clear()
  localStorage.clear()
  useRetroMode.getState().setMode(null)
})

it('travels the webring to the neighbouring worlds', () => {
  render(<Web98World locale="pt" onExit={vi.fn()} />)
  const ring = screen.getByRole('navigation', { name: 'Webring dos Mundos Retrô' })
  fireEvent.click(within(ring).getByRole('button', { name: /Próximo: Windows XP/ }))
  expect(document.documentElement).toHaveAttribute('data-retro-mode', 'xp')
  fireEvent.click(within(ring).getByRole('button', { name: /Anterior: Macintosh/ }))
  expect(document.documentElement).toHaveAttribute('data-retro-mode', 'mac')
})

it('signs the guestbook, keeps the entry in this browser and returns focus on Escape', () => {
  render(<Web98World locale="pt" onExit={vi.fn()} />)
  const opener = within(screen.getByRole('navigation', { name: 'Homepage 1998' })).getByRole(
    'button',
    { name: 'Livro de visitas' },
  )
  opener.focus()
  fireEvent.click(opener)

  const book = screen.getByRole('dialog', { name: 'Livro de visitas — Internet Explorer' })
  const name = within(book).getByRole('textbox', { name: 'Seu nome' })
  expect(name).toHaveFocus()
  expect(within(book).getByText('Webmaster_99')).toBeInTheDocument()

  fireEvent.change(name, { target: { value: 'Visitante de teste' } })
  fireEvent.change(within(book).getByRole('textbox', { name: 'Recado' }), {
    target: { value: 'Que saudade do modem!' },
  })
  fireEvent.click(within(book).getByRole('button', { name: 'Assinar' }))

  expect(within(book).getByText('Que saudade do modem!')).toBeInTheDocument()
  expect(within(book).getByRole('status')).toHaveTextContent('Valeu por assinar!')
  expect(localStorage.getItem('retro-1998-guestbook')).toContain('Visitante de teste')

  fireEvent.keyDown(name, { key: 'Escape' })
  expect(screen.queryByRole('dialog', { name: /Livro de visitas/ })).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
})

it('minimizes the browser window and shows where links go in the status bar', () => {
  render(<Web98World locale="en" onExit={vi.fn()} />)
  fireEvent.mouseOver(screen.getByRole('link', { name: 'Projects' }))
  expect(screen.getByText(/^Shortcut to .*\/projects$/)).toBeInTheDocument()

  const minimize = screen.getByRole('button', { name: 'Minimize window' })
  fireEvent.click(minimize)
  expect(screen.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Restore window' }))
  expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
})

it('closes from the title bar and the taskbar', () => {
  const onExit = vi.fn()
  render(<Web98World locale="es" onExit={onExit} />)
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar y volver al futuro' }))
  fireEvent.click(screen.getByRole('button', { name: 'Volver al futuro' }))
  expect(onExit).toHaveBeenCalledTimes(2)
})

it('toggles the background MIDI and the shared sound switch', () => {
  render(<Web98World locale="pt" onExit={vi.fn()} />)
  const midi = screen.getByRole('button', { name: 'Tocar MIDI de fundo' })
  fireEvent.click(midi)
  expect(screen.getByRole('button', { name: 'Parar MIDI de fundo' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  fireEvent.click(screen.getByRole('button', { name: 'Desligar o som' }))
  expect(sessionStorage.getItem('retro-sound')).toBe('off')
  expect(screen.getByRole('button', { name: 'Tocar MIDI de fundo' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})

// These turn reduced motion off, so they run last.
it('dials up once per session, and a key press skips the modem', () => {
  mockMatchMedia({})
  vi.useFakeTimers()
  const first = render(<Web98World locale="pt" onExit={vi.fn()} />)
  const dial = screen.getByRole('dialog', { name: 'Conectar a Internet Ranielli' })
  expect(within(dial).getByRole('status')).toHaveTextContent('Discando...')
  act(() => vi.advanceTimersByTime(1200))
  expect(within(dial).getByRole('status')).toHaveTextContent('Verificando')
  fireEvent.keyDown(window, { key: 'Enter' })
  expect(screen.queryByRole('dialog', { name: /Conectar/ })).not.toBeInTheDocument()
  expect(sessionStorage.getItem('retro-booted-1998')).toBe('1')

  first.unmount()
  render(<Web98World locale="pt" onExit={vi.fn()} />)
  expect(screen.queryByRole('dialog', { name: /Conectar/ })).not.toBeInTheDocument()
})

it('cancels the connection back to the future', () => {
  mockMatchMedia({})
  const onExit = vi.fn()
  render(<Web98World locale="pt" onExit={onExit} />)
  const dial = screen.getByRole('dialog', { name: 'Conectar a Internet Ranielli' })
  fireEvent.click(within(dial).getByRole('button', { name: 'Cancelar' }))
  expect(onExit).toHaveBeenCalled()
})

it('skips the modem with a click and leaves a sparkle trail behind the mouse', () => {
  mockMatchMedia({ '(pointer: fine)': true })
  const animate = vi.fn()
  Element.prototype.animate = animate as unknown as Element['animate']
  render(<Web98World locale="en" onExit={vi.fn()} />)
  expect(screen.getByRole('dialog', { name: 'Connect to Ranielli Internet' })).toBeInTheDocument()
  fireEvent.pointerDown(document.body)
  expect(screen.queryByRole('dialog', { name: /Connect/ })).not.toBeInTheDocument()

  const move = new PointerEvent('pointermove', { clientX: 40, clientY: 50, pointerType: 'mouse' })
  window.dispatchEvent(move)
  window.dispatchEvent(
    new PointerEvent('pointermove', { clientX: 1, clientY: 1, pointerType: 'touch' }),
  )
  expect(animate).toHaveBeenCalledTimes(1)
  expect(document.querySelectorAll('.w98-sparkles > span')).toHaveLength(16)
})

it('loops the MIDI, stops it with Stop and replays the dial-up with Refresh', () => {
  mockMatchMedia({})
  sessionStorage.setItem('retro-booted-1998', '1')
  vi.useFakeTimers()
  render(<Web98World locale="en" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Turn sound off' }))
  fireEvent.click(screen.getByRole('button', { name: 'Play background MIDI' }))
  expect(screen.getByRole('button', { name: 'Stop background MIDI' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(sessionStorage.getItem('retro-sound')).toBe('on')
  act(() => vi.advanceTimersByTime(10_000))
  fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
  expect(screen.getByRole('button', { name: 'Play background MIDI' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  expect(document.querySelector('.w98-marquee')).toHaveAttribute('data-stopped', 'true')

  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
  expect(screen.getByRole('dialog', { name: 'Connect to Ranielli Internet' })).toBeInTheDocument()
  act(() => vi.advanceTimersByTime(3700))
  expect(screen.queryByRole('dialog', { name: /Connect/ })).not.toBeInTheDocument()
})

it('goes home, back and forward, and to a random world', () => {
  const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
  const forward = vi.spyOn(window.history, 'forward').mockImplementation(() => {})
  render(<Web98World locale="pt" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
  fireEvent.click(screen.getByRole('button', { name: 'Avançar' }))
  fireEvent.click(screen.getByRole('button', { name: 'Página inicial' }))
  expect(back).toHaveBeenCalled()
  expect(forward).toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Aleatório' }))
  expect(document.documentElement.getAttribute('data-retro-mode')).not.toBe('1998')
})
