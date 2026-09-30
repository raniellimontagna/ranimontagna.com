import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { GameBoyWorld } from '../gameboy-world'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('@/shared/config/i18n/navigation', () => ({
  useRouter: () => ({ push }),
}))

afterEach(() => {
  cleanup()
  push.mockClear()
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
