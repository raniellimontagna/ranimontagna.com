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

  it.each([
    ['ver', 'version'],
    ['DATE', 'date'],
    ['time', 'time'],
    ['tree', 'tree'],
    ['whoami', 'whoami'],
    ['mem', 'memory'],
    ['cv', 'resume'],
    ['matrix', 'matrix'],
    ['cd ..', 'up'],
  ])('knows the classic %s', (command, type) => {
    expect(parseDosCommand(command)).toEqual({ type })
  })

  it('reads only the files that exist', () => {
    expect(parseDosCommand('type LEIAME.TXT')).toEqual({ type: 'type', file: 'readme' })
    expect(parseDosCommand('type ../../etc/passwd')).toEqual({
      type: 'missing',
      file: '../../etc/passwd',
    })
  })

  it('enters folders and other worlds from fixed tables', () => {
    expect(parseDosCommand('cd projetos')).toEqual({
      type: 'navigate',
      href: '/projects',
      label: 'projects',
    })
    expect(parseDosCommand('win')).toEqual({ type: 'world', mode: '1998' })
    expect(parseDosCommand('cd constructor')).toEqual({
      type: 'unknown',
      command: 'cd constructor',
    })
  })

  it('accepts the four colors and nothing else', () => {
    expect(parseDosCommand('color 0e')).toEqual({ type: 'color', color: 'amber' })
    expect(parseDosCommand('color')).toEqual({ type: 'color', color: null })
    expect(parseDosCommand('color zz')).toEqual({ type: 'unknown', command: 'color zz' })
  })

  it('echoes text back as text', () => {
    expect(parseDosCommand('echo <b>oi</b>')).toEqual({ type: 'echo', text: '<b>oi</b>' })
  })
})
