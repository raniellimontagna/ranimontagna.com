import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { MacWorld } from '../mac-world'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  sessionStorage.clear()
})

function menu(name: string) {
  fireEvent.click(screen.getByRole('button', { name }))
  return screen.getByRole('menu', { name })
}

it('selects an icon with one click and opens it with a double-click', () => {
  mockMatchMedia({})
  render(<MacWorld locale="pt" onExit={vi.fn()} />)
  const projects = screen.getByRole('button', { name: 'Projetos', pressed: false })
  fireEvent.click(projects, { detail: 1 })
  expect(projects).toHaveAttribute('aria-pressed', 'true')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.doubleClick(projects)
  const window = screen.getByRole('dialog', { name: 'Projetos' })
  expect(within(window).getByRole('link', { name: 'Grimory' })).toHaveAttribute(
    'href',
    '/projects/grimory',
  )
  fireEvent.click(within(window).getByRole('button', { name: 'Fechar — Projetos' }))
  expect(screen.queryByRole('dialog', { name: 'Projetos' })).not.toBeInTheDocument()
})

it('drops menus, moves through them with the keyboard and closes on Escape', () => {
  render(<MacWorld locale="en" onExit={vi.fn()} />)
  const file = menu('File')
  const items = within(file).getAllByRole('menuitem')
  expect(items[0]).toHaveFocus()
  // Close Window is disabled with no window open, so the arrow skips it.
  fireEvent.keyDown(items[0], { key: 'ArrowDown' })
  expect(document.activeElement).toHaveTextContent('Back to the future')
  fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' })
  expect(screen.getByRole('menu', { name: 'Edit' })).toBeInTheDocument()
  fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus()
})

it('opens About This Macintosh from the system menu and empties the Trash', () => {
  render(<MacWorld locale="en" onExit={vi.fn()} />)
  fireEvent.click(
    within(menu('System menu')).getByRole('menuitem', { name: /About This Macintosh/ }),
  )
  expect(screen.getByRole('dialog', { name: 'About This Macintosh' })).toHaveTextContent(
    'RaniOS 7.5.5',
  )

  fireEvent.click(screen.getByRole('button', { name: 'Trash' }))
  expect(screen.getByRole('dialog', { name: 'Trash' })).toHaveTextContent('bugs-from-2019.txt')
  fireEvent.click(within(menu('Special')).getByRole('menuitem', { name: 'Empty Trash' }))
  expect(screen.getByRole('dialog', { name: 'Trash' })).toHaveTextContent('The Trash is empty.')
  expect(within(menu('Special')).getByRole('menuitem', { name: 'Empty Trash' })).toBeDisabled()
})

it('switches the disk to a list and copies the email', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<MacWorld locale="pt" onExit={vi.fn()} />)
  fireEvent.click(within(menu('Visualizar')).getByRole('menuitemradio', { name: 'por Lista' }))
  fireEvent.click(screen.getByRole('button', { name: 'Macintosh HD' }))
  expect(document.querySelector('.mac-disk')).toHaveAttribute('data-list', 'true')

  const copyItem = within(menu('Editar')).getByRole('menuitem', { name: 'Copiar e-mail' })
  await act(async () => {
    fireEvent.click(copyItem)
  })
  expect(writeText).toHaveBeenCalledWith('contato@ranimontagna.com')
})

it('shuts down to the safe screen, then goes back to the future', () => {
  vi.useFakeTimers()
  const onExit = vi.fn()
  render(<MacWorld locale="es" onExit={onExit} />)
  fireEvent.click(within(menu('Especial')).getByRole('menuitem', { name: 'Apagar' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent('Ya puedes apagar el ordenador')
  act(() => vi.advanceTimersByTime(2700))
  expect(onExit).toHaveBeenCalledOnce()
})

it('boots with the smiling computer once per session', () => {
  mockMatchMedia({})
  vi.useFakeTimers()
  const first = render(<MacWorld locale="en" onExit={vi.fn()} />)
  expect(document.querySelector('.mac-boot')).not.toBeNull()
  act(() => vi.advanceTimersByTime(1400))
  expect(document.querySelector('.mac-boot')).toHaveTextContent('Welcome to RaniOS')
  fireEvent.keyDown(window, { key: 'Enter' })
  expect(document.querySelector('.mac-boot')).toBeNull()
  first.unmount()
  render(<MacWorld locale="en" onExit={vi.fn()} />)
  expect(document.querySelector('.mac-boot')).toBeNull()
})
