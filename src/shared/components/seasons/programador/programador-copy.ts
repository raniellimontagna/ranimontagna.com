/** Programmer's Day texts in the site's three languages. `{name}` marks a value to fill in. */

/** A pull request in the code review game: the code is the same in every language. */
export type ReviewPr = {
  title: string
  lines: readonly string[]
  /** Index of the line with the bug. */
  bug: number
  /** Why that line is wrong, and what fixes it. */
  why: string
  /** The fix, in a few characters, for the card. */
  fix: string
}

export type ProgramadorCopy = {
  oneDay: string
  /** `{n}` days to day 256. */
  manyDays: string
  day: string
  after: string
  sound: string
  title: string
  intro: string
  /** `{n}`, `{total}` and `{title}`. */
  prHeading: string
  /** `{n}` and `{code}`: every line has its own name for screen readers. */
  line: string
  clean: string
  /** `{n}`: the line with the bug. */
  found: string
  next: string
  approve: string
  /** `{n}` of `{total}`. */
  progress: string
  cardTitle: string
  cardBody: string
  shareText: string
  share: string
  linkCopied: string
  close: string
  prs: readonly [ReviewPr, ReviewPr, ReviewPr, ReviewPr, ReviewPr]
}

const CODE = {
  last: ['function last(items) {', '  return items[items.length]', '}'],
  admin: [
    'function canEdit(user) {',
    "  if (user.role = 'admin') {",
    '    return true',
    '  }',
    '  return false',
    '}',
  ],
  load: [
    'async function load(id) {',
    // biome-ignore lint/suspicious/noTemplateCurlyInString: this is code shown on screen.
    '  const res = fetch(`/api/${id}`)',
    '  if (!res.ok) throw Error(id)',
    '  return res.json()',
    '}',
  ],
  top: [
    'function top(scores) {',
    '  const sorted = [...scores].sort()',
    '  return sorted[sorted.length - 1]',
    '}',
  ],
  timers: [
    'for (var i = 0; i < 3; i++) {',
    '  setTimeout(() => {',
    '    console.log(i)',
    '  }, 100)',
    '}',
  ],
} as const

const COPY: Record<'pt' | 'en' | 'es', ProgramadorCopy> = {
  pt: {
    oneDay: 'Falta 1 dia para o dia 256',
    manyDays: 'Faltam {n} dias para o dia 256',
    day: 'Feliz Dia do Programador!',
    after: 'return 0;',
    sound: 'Som de teclado',
    title: 'Code review',
    intro: 'Hoje é dia de revisar código. Cada PR tem uma linha com bug: toque nela.',
    prHeading: 'PR {n} de {total}: {title}',
    line: 'Linha {n}: {code}',
    clean: 'Essa linha está ok. Procure o bug.',
    found: 'Bug achado na linha {n}.',
    next: 'Próximo PR',
    approve: 'Ver aprovação',
    progress: '{n} de {total} PRs revisados',
    cardTitle: 'LGTM: aprovado no code review',
    cardBody: 'Você achou os 5 bugs. Feliz Dia do Programador!',
    shareText: 'Achei os 5 bugs no code review do site do Ranielli. Feliz Dia do Programador!',
    share: 'Compartilhar',
    linkCopied: 'Link copiado',
    close: 'Fechar',
    prs: [
      {
        title: 'Pega o último item',
        lines: CODE.last,
        bug: 1,
        why: 'Os índices vão de 0 a length - 1: items[items.length] é sempre undefined.',
        fix: 'items.length - 1',
      },
      {
        title: 'Só admin edita',
        lines: CODE.admin,
        bug: 1,
        why: 'Um = só atribui: todo usuário vira admin. Para comparar, ===.',
        fix: "user.role === 'admin'",
      },
      {
        title: 'Busca o perfil',
        lines: CODE.load,
        bug: 1,
        why: 'Sem await, res é uma Promise: res.ok não existe e a função sempre falha.',
        fix: 'await fetch(…)',
      },
      {
        title: 'Maior nota',
        lines: CODE.top,
        bug: 1,
        why: 'Sem comparador, sort() ordena como texto: [9, 10, 100] vira [10, 100, 9].',
        fix: 'sort((a, b) => a - b)',
      },
      {
        title: 'Três avisos',
        lines: CODE.timers,
        bug: 0,
        why: 'Com var, as três funções veem o mesmo i, que já vale 3: sai 3, 3, 3. Com let, cada volta tem o seu.',
        fix: 'let i',
      },
    ],
  },
  en: {
    oneDay: '1 day to day 256',
    manyDays: '{n} days to day 256',
    day: "Happy Programmer's Day!",
    after: 'return 0;',
    sound: 'Keyboard sound',
    title: 'Code review',
    intro: 'Today is a day for reviewing code. Each PR has one line with a bug: tap it.',
    prHeading: 'PR {n} of {total}: {title}',
    line: 'Line {n}: {code}',
    clean: 'That line is fine. Look for the bug.',
    found: 'Bug found on line {n}.',
    next: 'Next PR',
    approve: 'See the approval',
    progress: '{n} of {total} PRs reviewed',
    cardTitle: 'LGTM: approved in code review',
    cardBody: "You found all 5 bugs. Happy Programmer's Day!",
    shareText: "I found all 5 bugs in the code review on Ranielli's site. Happy Programmer's Day!",
    share: 'Share',
    linkCopied: 'Link copied',
    close: 'Close',
    prs: [
      {
        title: 'Get the last item',
        lines: CODE.last,
        bug: 1,
        why: 'Indexes run from 0 to length - 1: items[items.length] is always undefined.',
        fix: 'items.length - 1',
      },
      {
        title: 'Admins only',
        lines: CODE.admin,
        bug: 1,
        why: 'A single = assigns: every user becomes an admin. To compare, ===.',
        fix: "user.role === 'admin'",
      },
      {
        title: 'Fetch the profile',
        lines: CODE.load,
        bug: 1,
        why: 'Without await, res is a Promise: res.ok does not exist and it always throws.',
        fix: 'await fetch(…)',
      },
      {
        title: 'Top score',
        lines: CODE.top,
        bug: 1,
        why: 'Without a comparator, sort() orders as text: [9, 10, 100] becomes [10, 100, 9].',
        fix: 'sort((a, b) => a - b)',
      },
      {
        title: 'Three alerts',
        lines: CODE.timers,
        bug: 0,
        why: 'With var, all three callbacks share one i, already 3: it logs 3, 3, 3. With let, each turn gets its own.',
        fix: 'let i',
      },
    ],
  },
  es: {
    oneDay: 'Falta 1 día para el día 256',
    manyDays: 'Faltan {n} días para el día 256',
    day: '¡Feliz Día del Programador!',
    after: 'return 0;',
    sound: 'Sonido de teclado',
    title: 'Code review',
    intro: 'Hoy es día de revisar código. Cada PR tiene una línea con un bug: tócala.',
    prHeading: 'PR {n} de {total}: {title}',
    line: 'Línea {n}: {code}',
    clean: 'Esa línea está bien. Busca el bug.',
    found: 'Bug encontrado en la línea {n}.',
    next: 'Siguiente PR',
    approve: 'Ver la aprobación',
    progress: '{n} de {total} PRs revisados',
    cardTitle: 'LGTM: aprobado en el code review',
    cardBody: '¡Encontraste los 5 bugs! ¡Feliz Día del Programador!',
    shareText:
      'Encontré los 5 bugs en el code review del sitio de Ranielli. ¡Feliz Día del Programador!',
    share: 'Compartir',
    linkCopied: 'Enlace copiado',
    close: 'Cerrar',
    prs: [
      {
        title: 'Toma el último elemento',
        lines: CODE.last,
        bug: 1,
        why: 'Los índices van de 0 a length - 1: items[items.length] siempre es undefined.',
        fix: 'items.length - 1',
      },
      {
        title: 'Solo admins',
        lines: CODE.admin,
        bug: 1,
        why: 'Un solo = asigna: todo usuario se vuelve admin. Para comparar, ===.',
        fix: "user.role === 'admin'",
      },
      {
        title: 'Busca el perfil',
        lines: CODE.load,
        bug: 1,
        why: 'Sin await, res es una Promise: res.ok no existe y la función siempre falla.',
        fix: 'await fetch(…)',
      },
      {
        title: 'Nota más alta',
        lines: CODE.top,
        bug: 1,
        why: 'Sin comparador, sort() ordena como texto: [9, 10, 100] queda [10, 100, 9].',
        fix: 'sort((a, b) => a - b)',
      },
      {
        title: 'Tres avisos',
        lines: CODE.timers,
        bug: 0,
        why: 'Con var, las tres funciones ven el mismo i, que ya vale 3: sale 3, 3, 3. Con let, cada vuelta tiene el suyo.',
        fix: 'let i',
      },
    ],
  },
}

export function getProgramadorCopy(locale: string): ProgramadorCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.pt
}
