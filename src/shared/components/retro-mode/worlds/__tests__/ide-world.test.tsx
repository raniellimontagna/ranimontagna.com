import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { IdeWorld } from '../ide-world'

const { push, pathname } = vi.hoisted(() => ({ push: vi.fn(), pathname: { current: '/' } }))

vi.mock('@/shared/config/i18n/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname.current,
  Link: ({ href, children, prefetch: _prefetch, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>
      {children as React.ReactNode}
    </a>
  ),
}))

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  push.mockClear()
  pathname.current = '/'
  vi.useRealTimers()
  vi.restoreAllMocks()
  sessionStorage.clear()
  useRetroMode.getState().setMode(null)
})

function terminal(command: string) {
  const input = screen.getByRole('textbox', { name: 'Comando do terminal' })
  fireEvent.change(input, { target: { value: command } })
  fireEvent.submit(input.closest('form') as HTMLFormElement)
}

it('opens files from the explorer as tabs with real links inside the code', () => {
  render(<IdeWorld locale="pt" onExit={vi.fn()} />)
  const code = screen.getByRole('tabpanel', { name: 'README.md' })
  expect(within(code).getByRole('link', { name: 'Projetos' })).toHaveAttribute('href', '/projects')

  const explorer = screen.getByRole('navigation', { name: 'Explorer' })
  fireEvent.click(within(explorer).getByRole('button', { name: /projetos\.json/ }))
  const json = screen.getByRole('tabpanel', { name: 'projetos.json' })
  expect(json).toHaveTextContent('"grimory"')
  expect(within(json).getByRole('link', { name: '/projects/grimory' })).toBeInTheDocument()
  expect(screen.getAllByRole('tab')).toHaveLength(2)

  fireEvent.click(screen.getByRole('button', { name: 'Fechar projetos.json' }))
  expect(screen.getAllByRole('tab')).toHaveLength(1)
  expect(screen.getByRole('tab', { name: /README\.md/ })).toHaveAttribute('aria-selected', 'true')
})

it('follows the page the visitor is on', () => {
  pathname.current = '/blog'
  render(<IdeWorld locale="en" onExit={vi.fn()} />)
  expect(screen.getByRole('tab', { name: /blog\.mdx/ })).toHaveAttribute('aria-selected', 'true')
})

it('answers the terminal: ls, cat, open, npm test and unknown commands', () => {
  render(<IdeWorld locale="pt" onExit={vi.fn()} />)
  const log = screen.getByRole('log')
  terminal('ls')
  expect(log).toHaveTextContent('contato.ts')
  terminal('cat sobre.md')
  expect(log).toHaveTextContent('Engenheiro de produto')
  terminal('cat senhas.txt')
  expect(log).toHaveTextContent('cat: senhas.txt: arquivo não encontrado')
  terminal('open contato.ts')
  expect(screen.getByRole('tab', { name: /contato\.ts/ })).toHaveAttribute('aria-selected', 'true')
  terminal('npm test')
  expect(log).toHaveTextContent('todos os testes passaram')
  terminal('rm -rf /')
  expect(log).toHaveTextContent('zsh: comando não encontrado: rm -rf /')
})

it('opens the command palette with Ctrl+P, filters it and runs a world switch', () => {
  render(<IdeWorld locale="pt" onExit={vi.fn()} />)
  expect(fireEvent.keyDown(window, { key: 'p', ctrlKey: true })).toBe(false)
  const palette = screen.getByRole('dialog', { name: 'Paleta de comandos' })
  const search = within(palette).getByRole('combobox', { name: 'Buscar arquivos e comandos' })
  expect(search).toHaveFocus()
  fireEvent.change(search, { target: { value: 'game' } })
  expect(within(palette).getAllByRole('option')).toHaveLength(1)
  fireEvent.keyDown(search, { key: 'Enter' })
  expect(document.documentElement).toHaveAttribute('data-retro-mode', 'gameboy')
  expect(screen.queryByRole('dialog', { name: 'Paleta de comandos' })).not.toBeInTheDocument()
})

it('closes the palette with Escape and returns focus to its button', () => {
  render(<IdeWorld locale="en" onExit={vi.fn()} />)
  const button = screen.getByRole('button', { name: /Go to file/ })
  button.focus()
  fireEvent.click(button)
  const search = screen.getByRole('combobox', { name: 'Search files and commands' })
  fireEvent.keyDown(search, { key: 'ArrowDown' })
  fireEvent.keyDown(search, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(button).toHaveFocus()
})

it('runs the rest of the terminal and every palette command', () => {
  const onExit = vi.fn()
  render(<IdeWorld locale="en" onExit={onExit} />)
  const log = screen.getByRole('log')
  const run = (command: string) => {
    const input = screen.getByRole('textbox', { name: 'Terminal command' })
    fireEvent.change(input, { target: { value: command } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)
  }
  run('help')
  run('whoami')
  run('git log')
  run('npm run dev')
  run('open nowhere.md')
  run('npm install')
  expect(log).toHaveTextContent('Commands: ls')
  expect(log).toHaveTextContent('product engineer')
  expect(log).toHaveTextContent('feat(retro)')
  expect(log).toHaveTextContent('Ready in 1998ms')
  expect(log).toHaveTextContent('cat: nowhere.md: no such file')
  expect(log).toHaveTextContent('zsh: command not found: npm install')
  run('clear')
  expect(log).toBeEmptyDOMElement()

  fireEvent.keyDown(window, { key: 'F1' })
  let search = screen.getByRole('combobox', { name: 'Search files and commands' })
  fireEvent.change(search, { target: { value: 'zzzz' } })
  expect(screen.getByText('No results')).toBeInTheDocument()
  fireEvent.keyDown(search, { key: 'Enter' })
  fireEvent.change(search, { target: { value: '' } })
  fireEvent.keyDown(search, { key: 'ArrowDown' })
  fireEvent.keyDown(search, { key: 'ArrowDown' })
  fireEvent.keyDown(search, { key: 'ArrowUp' })
  const second = screen.getAllByRole('option')[1]
  expect(second).toHaveAttribute('aria-selected', 'true')
  fireEvent.click(second)
  expect(screen.getByRole('tab', { name: /about\.md/ })).toHaveAttribute('aria-selected', 'true')

  for (const label of [
    '> Terminal: npm run dev',
    '> Terminal: clear',
    '> Open: Projects',
    '> Back to the future',
  ]) {
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    search = screen.getByRole('combobox', { name: 'Search files and commands' })
    fireEvent.click(screen.getByRole('option', { name: label }))
  }
  expect(push).toHaveBeenCalledWith('/projects')
  expect(onExit).toHaveBeenCalledOnce()

  fireEvent.keyDown(window, { key: 'p', ctrlKey: true })
  fireEvent.click(document.querySelector('.ide-palette-backdrop') as HTMLElement)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  run('exit')
  expect(onExit).toHaveBeenCalledTimes(2)
})

it('follows hash links to the about and contact files', () => {
  render(<IdeWorld locale="pt" onExit={vi.fn()} />)
  act(() => {
    window.location.hash = '#contact'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
  expect(screen.getByRole('tab', { name: /contato\.ts/ })).toHaveAttribute('aria-selected', 'true')
  act(() => {
    window.location.hash = '#about'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
  expect(screen.getByRole('tab', { name: /sobre\.md/ })).toHaveAttribute('aria-selected', 'true')
  window.location.hash = ''
})

// Turns reduced motion off, so it runs last.
it('starts the dev server and types the README on arrival', () => {
  mockMatchMedia({})
  vi.useFakeTimers()
  render(<IdeWorld locale="en" onExit={vi.fn()} />)
  const code = screen.getByRole('tabpanel', { name: 'README.md' })
  expect(code).not.toHaveTextContent('Where to go')
  for (let i = 0; i < 80; i++) act(() => vi.advanceTimersByTime(16))
  expect(code).toHaveTextContent('Where to go')

  for (let i = 0; i < 30; i++) act(() => vi.advanceTimersByTime(100))
  expect(screen.getByRole('log')).toHaveTextContent('Ready in 1998ms')
  expect(sessionStorage.getItem('retro-booted-ide')).toBe('1')
})
