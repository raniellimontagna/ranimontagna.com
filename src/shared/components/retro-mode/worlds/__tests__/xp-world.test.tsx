import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { XpWorld } from '../xp-world'

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  document.documentElement.removeAttribute('data-retro-mode')
  document.documentElement.removeAttribute('data-retro')
})

it('opens Start with accessible navigation and closes on Escape, restoring focus', () => {
  render(<XpWorld locale="pt" onExit={vi.fn()} />)
  const start = screen.getByRole('button', { name: 'Iniciar' })
  expect(start).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByRole('navigation', { name: 'Menu Iniciar' })).not.toBeInTheDocument()

  fireEvent.click(start)

  const menu = screen.getByRole('navigation', { name: 'Menu Iniciar' })
  expect(start).toHaveAttribute('aria-expanded', 'true')
  expect(within(menu).getByRole('link', { name: 'Início' })).toHaveFocus()
  fireEvent.keyDown(within(menu).getByRole('link', { name: 'Início' }), { key: 'Escape' })
  expect(screen.queryByRole('navigation', { name: 'Menu Iniciar' })).not.toBeInTheDocument()
  expect(start).toHaveFocus()
})

it('closes Start on an outside pointer interaction and when a destination is selected', () => {
  render(<XpWorld locale="pt" onExit={vi.fn()} />)
  const start = screen.getByRole('button', { name: 'Iniciar' })
  fireEvent.click(start)
  fireEvent.pointerDown(document.body)
  expect(start).toHaveAttribute('aria-expanded', 'false')

  fireEvent.click(start)
  const menu = screen.getByRole('navigation', { name: 'Menu Iniciar' })
  const projectsLink = within(menu).getByRole('link', { name: 'Projetos' })
  projectsLink.addEventListener('click', (event) => event.preventDefault(), { once: true })
  fireEvent.click(projectsLink)
  expect(start).toHaveAttribute('aria-expanded', 'false')
})

it('closes Start when keyboard focus leaves the disclosure without moving focus back', () => {
  render(
    <>
      <XpWorld locale="pt" onExit={vi.fn()} />
      <input aria-label="Assunto" />
    </>,
  )
  const start = screen.getByRole('button', { name: 'Iniciar' })
  const input = screen.getByRole('textbox', { name: 'Assunto' })
  fireEvent.click(start)
  fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Tab' })
  act(() => input.focus())

  expect(start).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByRole('navigation', { name: 'Menu Iniciar' })).not.toBeInTheDocument()
  expect(input).toHaveFocus()
})

it('does not steal focus when Escape is pressed in an external text field', () => {
  render(
    <>
      <XpWorld locale="pt" onExit={vi.fn()} />
      <textarea aria-label="Mensagem" />
    </>,
  )
  const input = screen.getByRole('textbox', { name: 'Mensagem' })
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
  act(() => input.focus())
  fireEvent.keyDown(input, { key: 'Escape' })

  expect(input).toHaveFocus()
  expect(screen.queryByRole('navigation', { name: 'Menu Iniciar' })).not.toBeInTheDocument()
})

it('opens desktop programs as windows: keyboard opens at once, a mouse click only selects', () => {
  // A fine pointer: the global mock answers true to every query, coarse included.
  mockMatchMedia({})
  render(<XpWorld locale="pt" onExit={vi.fn()} />)
  const desktop = screen.getByRole('navigation', { name: 'Área de trabalho' })
  const about = within(desktop).getByRole('button', { name: 'Sobre mim' })

  fireEvent.click(about, { detail: 1 })
  expect(about).toHaveAttribute('aria-pressed', 'true')
  expect(screen.queryByRole('dialog', { name: 'sobre.txt — Bloco de notas' })).toBeNull()

  fireEvent.doubleClick(about)
  const notepad = screen.getByRole('dialog', { name: 'sobre.txt — Bloco de notas' })
  expect(within(notepad).getByRole('link', { name: /Ver a trajetória completa/ })).toHaveAttribute(
    'href',
    '/#about',
  )

  fireEvent.click(within(desktop).getByRole('button', { name: 'Projetos' }), { detail: 0 })
  const projects = screen.getByRole('dialog', { name: 'Projetos' })
  expect(within(projects).getByRole('link', { name: /Grimory/ })).toHaveAttribute(
    'href',
    '/projects/grimory',
  )

  fireEvent.keyDown(projects, { key: 'Escape' })
  expect(screen.queryByRole('dialog', { name: 'Projetos' })).toBeNull()
  fireEvent.click(within(notepad).getByRole('button', { name: 'Fechar' }))
  expect(screen.queryByRole('dialog', { name: 'sobre.txt — Bloco de notas' })).toBeNull()
})

it('minimizes a window to the taskbar and brings it back', () => {
  render(<XpWorld locale="pt" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Lixeira' }), { detail: 0 })
  const bin = screen.getByRole('dialog', { name: 'Lixeira' })
  fireEvent.click(within(bin).getByRole('button', { name: 'Minimizar' }))
  expect(bin).not.toBeVisible()
  const task = screen
    .getAllByRole('button', { name: 'Lixeira' })
    .find((button) => button.classList.contains('xp-task')) as HTMLElement
  fireEvent.click(task)
  expect(screen.getByRole('dialog', { name: 'Lixeira' })).toBeVisible()
})

it('minimizes and maximizes the Explorer that frames the real site', () => {
  render(<XpWorld locale="pt" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Maximizar — Explorer' }))
  expect(document.documentElement).toHaveAttribute('data-xp-explorer', 'max')
  fireEvent.click(screen.getByRole('button', { name: 'Minimizar — Explorer' }))
  expect(document.documentElement).toHaveAttribute('data-xp-explorer', 'min')
  fireEvent.click(screen.getByRole('button', { name: 'Portfólio — Explorer' }))
  expect(document.documentElement).not.toHaveAttribute('data-xp-explorer')
})

it('runs commands from Start, explains unknown ones and can jump to another universe', () => {
  render(<XpWorld locale="pt" onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
  fireEvent.click(screen.getByRole('button', { name: 'Executar...' }))
  const dialog = screen.getByRole('dialog', { name: 'Executar' })
  const field = within(dialog).getByRole('textbox', { name: 'Abrir:' })

  fireEvent.change(field, { target: { value: 'paciência' } })
  fireEvent.click(within(dialog).getByRole('button', { name: 'OK' }))
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Não foi possível encontrar')

  fireEvent.change(field, { target: { value: 'CMD' } })
  fireEvent.click(within(dialog).getByRole('button', { name: 'OK' }))
  expect(document.documentElement).toHaveAttribute('data-retro-mode', 'dos')
})

it('turns off through the shutdown dialog and leaves the universe', () => {
  vi.useFakeTimers()
  const onExit = vi.fn()
  render(<XpWorld locale="pt" onExit={onExit} />)
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
  fireEvent.click(screen.getByRole('button', { name: /Desligar o computador/ }))
  const dialog = screen.getByRole('alertdialog', { name: 'Desligar o computador' })
  expect(document.documentElement).toHaveAttribute('data-xp-dim', 'true')
  fireEvent.click(within(dialog).getByRole('button', { name: 'Desativar' }))
  expect(screen.getByRole('status')).toHaveTextContent('Salvando suas configurações')
  act(() => vi.advanceTimersByTime(2000))
  expect(onExit).toHaveBeenCalledOnce()
  vi.useRealTimers()
})

it('keeps a real exit on the Explorer window', () => {
  const onExit = vi.fn()
  render(<XpWorld locale="pt" onExit={onExit} />)
  fireEvent.click(screen.getByRole('button', { name: 'Voltar ao futuro — Explorer' }))
  expect(onExit).toHaveBeenCalledOnce()
})

it.each([
  ['en', 'Start', 'Start menu'],
  ['es', 'Inicio', 'Menú Inicio'],
])('localizes the XP shell for %s', (locale, startLabel, menuLabel) => {
  render(<XpWorld locale={locale} onExit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: startLabel }))
  expect(screen.getByRole('navigation', { name: menuLabel })).toBeInTheDocument()
})

describe('power options and windows up close', () => {
  beforeEach(() => {
    mockMatchMedia({})
    sessionStorage.setItem('retro-booted-xp', '1')
    sessionStorage.setItem('retro-xp-balloon', '1')
    Element.prototype.setPointerCapture = vi.fn()
  })

  function power(choice: string) {
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
    fireEvent.click(screen.getByRole('button', { name: /Desligar o computador/ }))
    fireEvent.click(
      within(screen.getByRole('alertdialog', { name: 'Desligar o computador' })).getByRole(
        'button',
        { name: choice },
      ),
    )
  }

  it('stands by until a key wakes the desktop', () => {
    vi.useFakeTimers()
    render(<XpWorld locale="pt" onExit={vi.fn()} />)
    power('Em espera')
    expect(document.querySelector('.xp-standby')).not.toBeNull()
    act(() => vi.advanceTimersByTime(400))
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(document.querySelector('.xp-standby')).toBeNull()
    vi.useRealTimers()
  })

  it('restarts into the boot screen, and Cancel keeps the desktop', () => {
    render(<XpWorld locale="pt" onExit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
    fireEvent.click(screen.getByRole('button', { name: /Desligar o computador/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    power('Reiniciar')
    expect(document.querySelector('.xp-boot')).not.toBeNull()
  })

  it('logs off through the saving screen to the welcome screen', () => {
    vi.useFakeTimers()
    render(<XpWorld locale="pt" onExit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
    fireEvent.click(screen.getByRole('button', { name: /Fazer logoff/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Fazendo logoff')
    act(() => vi.advanceTimersByTime(1900))
    expect(document.querySelector('.xp-welcome')).not.toBeNull()
    act(() => vi.advanceTimersByTime(2300))
    expect(document.querySelector('.xp-welcome')).toBeNull()
    vi.useRealTimers()
  })

  it('drags a window by its title bar', () => {
    render(<XpWorld locale="pt" onExit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Lixeira' }), { detail: 0 })
    const bin = screen.getByRole('dialog', { name: 'Lixeira' })
    const bar = bin.querySelector('.xp-window-titlebar') as HTMLElement
    const left = Number.parseFloat(bin.style.left)
    fireEvent.pointerDown(bar, { button: 0, clientX: 300, clientY: 150, pointerId: 1 })
    fireEvent.pointerMove(bar, { clientX: 340, clientY: 190, pointerId: 1 })
    fireEvent.pointerCancel(bar, { pointerId: 1 })
    expect(Number.parseFloat(bin.style.left)).toBe(left + 40)
  })

  it('selects icons with a mouse click and draws a selection band', () => {
    render(<XpWorld locale="pt" onExit={vi.fn()} />)
    const bin = screen.getByRole('button', { name: 'Lixeira' })
    fireEvent.click(bin, { detail: 1 })
    expect(bin).toHaveAttribute('aria-pressed', 'true')
    fireEvent.doubleClick(bin)
    expect(screen.getByRole('dialog', { name: 'Lixeira' })).toBeInTheDocument()

    const desktop = document.querySelector('.xp-desktop') as HTMLElement
    fireEvent.pointerDown(desktop, { pointerType: 'mouse', clientX: 0, clientY: 0, pointerId: 2 })
    fireEvent.pointerMove(desktop, {
      pointerType: 'mouse',
      clientX: 900,
      clientY: 700,
      pointerId: 2,
    })
    expect(document.querySelector('.xp-band')).not.toBeNull()
    fireEvent.pointerUp(desktop, { pointerType: 'mouse', pointerId: 2 })
    expect(document.querySelector('.xp-band')).toBeNull()
  })
})
