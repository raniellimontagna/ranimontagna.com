import type { RetroMode } from '@/shared/store/use-retro-mode/retro-modes'

export type DosFile = 'readme' | 'about' | 'contact'
export type DosColor = 'green' | 'amber' | 'white' | 'blue'

export type DosCommand =
  | {
      type:
        | 'empty'
        | 'help'
        | 'directory'
        | 'clear'
        | 'exit'
        | 'version'
        | 'date'
        | 'time'
        | 'tree'
        | 'whoami'
        | 'memory'
        | 'resume'
        | 'matrix'
        | 'beep'
        | 'format'
        | 'up'
    }
  | {
      type: 'navigate'
      href: '/#about' | '/projects' | '/blog' | '/#contact'
      label: 'about' | 'projects' | 'blog' | 'contact'
    }
  | { type: 'type'; file: DosFile }
  | { type: 'missing'; file: string }
  | { type: 'color'; color: DosColor | null }
  | { type: 'world'; mode: RetroMode }
  | { type: 'echo'; text: string }
  | { type: 'unknown'; command: string }

const SIMPLE = {
  help: 'help',
  ajuda: 'help',
  ayuda: 'help',
  '?': 'help',
  dir: 'directory',
  ls: 'directory',
  cls: 'clear',
  clear: 'clear',
  exit: 'exit',
  sair: 'exit',
  salir: 'exit',
  ver: 'version',
  date: 'date',
  time: 'time',
  tree: 'tree',
  whoami: 'whoami',
  mem: 'memory',
  cv: 'resume',
  resume: 'resume',
  curriculo: 'resume',
  matrix: 'matrix',
  beep: 'beep',
} as const

const DESTINATIONS = {
  sobre: { href: '/#about', label: 'about' },
  about: { href: '/#about', label: 'about' },
  projetos: { href: '/projects', label: 'projects' },
  projects: { href: '/projects', label: 'projects' },
  proyectos: { href: '/projects', label: 'projects' },
  blog: { href: '/blog', label: 'blog' },
  contato: { href: '/#contact', label: 'contact' },
  contact: { href: '/#contact', label: 'contact' },
  contacto: { href: '/#contact', label: 'contact' },
} as const

const FILES = {
  'leiame.txt': 'readme',
  'readme.txt': 'readme',
  'leeme.txt': 'readme',
  'sobre.txt': 'about',
  'about.txt': 'about',
  'contato.txt': 'contact',
  'contact.txt': 'contact',
  'contacto.txt': 'contact',
} as const

const COLORS = { '0a': 'green', '0e': 'amber', '07': 'white', '1f': 'blue' } as const

const WORLDS = {
  win: '1998',
  win98: '1998',
  xp: 'xp',
  mac: 'mac',
  gameboy: 'gameboy',
  jornal: 'newspaper',
  newspaper: 'newspaper',
  periodico: 'newspaper',
  code: 'ide',
  ide: 'ide',
} as const

function lookup<T extends object>(table: T, key: string): T[keyof T] | undefined {
  return Object.hasOwn(table, key) ? table[key as keyof T] : undefined
}

/** Every command that Tab can complete. */
export const DOS_COMPLETIONS = [
  ...Object.keys(SIMPLE),
  ...Object.keys(DESTINATIONS),
  ...Object.keys(WORLDS),
  'type leiame.txt',
  'type readme.txt',
  'type contato.txt',
  'type contact.txt',
  'color',
  'echo',
  'format c:',
  'cd',
].filter((command) => command !== '?')

/** Only complete, allowlisted commands can resolve to a portfolio destination. */
export function parseDosCommand(command: string): DosCommand {
  const trimmed = command.trim()
  const lower = trimmed.toLowerCase()
  if (!lower) return { type: 'empty' }

  const simple = lookup(SIMPLE, lower)
  if (simple) return { type: simple }
  const destination = lookup(DESTINATIONS, lower)
  if (destination) return { type: 'navigate', ...destination }
  const world = lookup(WORLDS, lower)
  if (world) return { type: 'world', mode: world }

  const [name, ...rest] = lower.split(/\s+/)
  const argument = rest.join(' ')

  if (name === 'echo') return { type: 'echo', text: trimmed.slice(4).trim() }
  if (name === 'cd' && rest.length === 1) {
    if (argument === '..' || argument === '\\') return { type: 'up' }
    const target = lookup(DESTINATIONS, argument)
    if (target) return { type: 'navigate', ...target }
  }
  if ((name === 'type' || name === 'cat') && rest.length === 1) {
    const file = lookup(FILES, argument)
    return file ? { type: 'type', file } : { type: 'missing', file: trimmed.split(/\s+/)[1] }
  }
  if (name === 'color' && rest.length <= 1) {
    if (!argument) return { type: 'color', color: null }
    const color = lookup(COLORS, argument)
    if (color) return { type: 'color', color }
  }
  if (name === 'format' && argument === 'c:') return { type: 'format' }

  return { type: 'unknown', command: trimmed }
}
