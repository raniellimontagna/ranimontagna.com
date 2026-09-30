import { parseDosCommand } from '../worlds/dos-command'

describe('parseDosCommand', () => {
  it.each([
    ['help', 'help'],
    ['ajuda', 'help'],
    ['dir', 'directory'],
    ['cls', 'clear'],
    ['clear', 'clear'],
    ['exit', 'exit'],
    ['sair', 'exit'],
  ])('recognizes the allowlisted command %s', (command, type) => {
    expect(parseDosCommand(command)).toEqual({ type })
  })

  it.each([
    ['sobre', '/#about', 'about'],
    ['about', '/#about', 'about'],
    ['projetos', '/projects', 'projects'],
    ['projects', '/projects', 'projects'],
    ['blog', '/blog', 'blog'],
    ['contato', '/#contact', 'contact'],
    ['contact', '/#contact', 'contact'],
  ])('maps %s to a fixed portfolio destination', (command, href, label) => {
    expect(parseDosCommand(command)).toEqual({ type: 'navigate', href, label })
  })

  it('ignores surrounding whitespace and command case', () => {
    expect(parseDosCommand('  PrOjEcTs  ')).toEqual({
      type: 'navigate',
      href: '/projects',
      label: 'projects',
    })
  })

  it('treats whitespace as an empty command', () => {
    expect(parseDosCommand(' \t\n ')).toEqual({ type: 'empty' })
  })

  it.each(['help && exit', 'projects https://example.com', 'javascript:alert(1)', '__proto__'])(
    'rejects arbitrary input %s without creating a destination',
    (command) => {
      expect(parseDosCommand(command)).toEqual({ type: 'unknown', command })
    },
  )
})
