import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { XpWorld } from '../xp-world'

afterEach(cleanup)

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

it('keeps desktop destinations as real links and provides an exit from the window', () => {
  const onExit = vi.fn()
  render(<XpWorld locale="pt" onExit={onExit} />)
  const desktop = screen.getByRole('navigation', { name: 'Área de trabalho' })
  expect(within(desktop).getByRole('link', { name: 'Sobre mim' })).toHaveAttribute(
    'href',
    '/#about',
  )
  expect(within(desktop).getByRole('link', { name: 'Projetos' })).toHaveAttribute(
    'href',
    '/projects',
  )
  expect(within(desktop).getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog')
  expect(within(desktop).getByRole('link', { name: 'Contato' })).toHaveAttribute(
    'href',
    '/#contact',
  )

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
