import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { DosWorld } from '../worlds/dos-world'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('@/shared/config/i18n/navigation', () => ({
  useRouter: () => ({ push }),
}))

beforeEach(() => {
  push.mockClear()
})

afterEach(cleanup)

function submit(command: string) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Comando DOS' }), {
    target: { value: command },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Executar' }))
}

it('prints help and an understandable message for unknown commands', () => {
  render(<DosWorld locale="pt" onExit={vi.fn()} />)
  submit('ajuda')
  const output = screen.getByRole('log')
  expect(output).toHaveTextContent('projetos / projects')
  expect(output).toHaveTextContent('cls / clear')
  submit('<script>alert(1)</script>')
  expect(output).toHaveTextContent('Comando não reconhecido')
  expect(output).toHaveTextContent('<script>alert(1)</script>')
  expect(output.querySelector('script')).toBeNull()
  expect(push).not.toHaveBeenCalled()
})

it('keeps the newest command output visible inside the terminal scroll area', () => {
  render(<DosWorld locale="pt" onExit={vi.fn()} />)
  const output = screen.getByRole('log')
  Object.defineProperty(output, 'scrollHeight', { configurable: true, value: 2000 })
  submit('ajuda')
  expect(output.scrollTop).toBe(2000)
})

it('recalls command history and restores the unfinished draft with input arrows', () => {
  render(<DosWorld locale="pt" onExit={vi.fn()} />)
  submit('dir')
  submit('ajuda')
  const input = screen.getByRole('textbox', { name: 'Comando DOS' })
  fireEvent.change(input, { target: { value: 'pro' } })
  fireEvent.keyDown(input, { key: 'ArrowUp' })
  expect(input).toHaveValue('ajuda')
  fireEvent.keyDown(input, { key: 'ArrowUp' })
  fireEvent.keyDown(input, { key: 'ArrowUp' })
  expect(input).toHaveValue('dir')
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  expect(input).toHaveValue('ajuda')
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  expect(input).toHaveValue('pro')
})

it('leaves keyboard events in the original contact form alone', () => {
  const contactSubmit = vi.fn((event) => event.preventDefault())
  render(
    <>
      <DosWorld locale="pt" onExit={vi.fn()} />
      <form aria-label="Contato original" onSubmit={contactSubmit}>
        <label htmlFor="message">Mensagem</label>
        <textarea id="message" />
        <button type="submit">Enviar</button>
      </form>
    </>,
  )
  submit('dir')
  const message = screen.getByRole('textbox', { name: 'Mensagem' })
  message.focus()
  expect(fireEvent.keyDown(message, { key: 'ArrowUp' })).toBe(true)
  expect(fireEvent.keyDown(message, { key: 'Enter' })).toBe(true)
  expect(message).toHaveFocus()
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
  expect(contactSubmit).toHaveBeenCalledOnce()
})

it.each(['cls', 'clear'])(
  'clears terminal output with %s while retaining command history',
  (command) => {
    render(<DosWorld locale="pt" onExit={vi.fn()} />)
    submit('dir')
    submit(command)
    expect(screen.getByRole('log')).toBeEmptyDOMElement()
    const input = screen.getByRole('textbox', { name: 'Comando DOS' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveValue(command)
  },
)

it.each([
  ['sobre', '/#about'],
  ['projects', '/projects'],
  ['blog', '/blog'],
  ['contato', '/#contact'],
])('routes %s through the locale-aware portfolio router', (command, href) => {
  render(<DosWorld locale="pt" onExit={vi.fn()} />)
  submit(command)
  expect(push).toHaveBeenCalledExactlyOnceWith(href)
})

it('moves focus to an existing destination section and restores its original tabindex', () => {
  render(
    <>
      <DosWorld locale="pt" onExit={vi.fn()} />
      <section id="about" aria-label="Biografia real">
        Conteúdo original
      </section>
    </>,
  )
  submit('about')
  const about = screen.getByRole('region', { name: 'Biografia real' })
  expect(about).toHaveFocus()
  expect(about.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' })
  fireEvent.blur(about)
  expect(about).not.toHaveAttribute('tabindex')
})

it('executes suggestions directly and keeps the command input available', () => {
  render(<DosWorld locale="pt" onExit={vi.fn()} />)
  const shortcuts = screen.getByRole('group', { name: 'Atalhos de comando' })
  fireEvent.click(within(shortcuts).getByRole('button', { name: 'Projetos' }))
  expect(push).toHaveBeenCalledExactlyOnceWith('/projects')
  expect(screen.getByRole('textbox', { name: 'Comando DOS' })).toHaveFocus()
})

it.each(['exit', 'sair'])('exits through the %s command', (command) => {
  const onExit = vi.fn()
  render(<DosWorld locale="pt" onExit={onExit} />)
  submit(command)
  expect(onExit).toHaveBeenCalledOnce()
})

it('provides the common exit button in the bottom control bar', () => {
  const onExit = vi.fn()
  render(<DosWorld locale="pt" onExit={onExit} />)
  const exit = screen.getByRole('button', { name: /Voltar ao futuro/ })
  expect(exit).toHaveAttribute('data-retro-exit')
  fireEvent.click(exit)
  expect(onExit).toHaveBeenCalledOnce()
})

it.each([
  ['en', 'DOS command', 'Run', 'Command shortcuts'],
  ['es', 'Comando DOS', 'Ejecutar', 'Atajos de comando'],
])('localizes the terminal interface for %s', (locale, inputLabel, execute, groupLabel) => {
  render(<DosWorld locale={locale} onExit={vi.fn()} />)
  expect(screen.getByRole('textbox', { name: inputLabel })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: execute })).toBeInTheDocument()
  expect(screen.getByRole('group', { name: groupLabel })).toBeInTheDocument()
})
