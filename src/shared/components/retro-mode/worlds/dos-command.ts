export type DosCommand =
  | { type: 'empty' | 'help' | 'directory' | 'clear' | 'exit' }
  | {
      type: 'navigate'
      href: '/#about' | '/projects' | '/blog' | '/#contact'
      label: 'about' | 'projects' | 'blog' | 'contact'
    }
  | { type: 'unknown'; command: string }

/** Only complete, allowlisted commands can resolve to a portfolio destination. */
export function parseDosCommand(command: string): DosCommand {
  switch (command.trim().toLowerCase()) {
    case '':
      return { type: 'empty' }
    case 'help':
    case 'ajuda':
      return { type: 'help' }
    case 'dir':
      return { type: 'directory' }
    case 'sobre':
    case 'about':
      return { type: 'navigate', href: '/#about', label: 'about' }
    case 'projetos':
    case 'projects':
      return { type: 'navigate', href: '/projects', label: 'projects' }
    case 'blog':
      return { type: 'navigate', href: '/blog', label: 'blog' }
    case 'contato':
    case 'contact':
      return { type: 'navigate', href: '/#contact', label: 'contact' }
    case 'cls':
    case 'clear':
      return { type: 'clear' }
    case 'exit':
    case 'sair':
      return { type: 'exit' }
    default:
      return { type: 'unknown', command: command.trim() }
  }
}
