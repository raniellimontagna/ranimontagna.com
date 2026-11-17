import { attoWhatsappHref } from '@/features/home/components/atto/atto.data'
import { getWorldBio } from '../world-bio'
import { WORLD_PROJECT_LINES, WORLD_PROJECTS } from '../world-projects'

export type IdeFile = {
  name: string
  language: string
  /** The page this file stands for, so the editor can follow the site's navigation. */
  route: '/' | '/#about' | '/projects' | '/blog' | '/#contact'
  lines: string[]
}

const copy = {
  pt: {
    explorer: 'Explorador',
    editor: 'Editor',
    openFile: 'Abrir',
    closeTab: 'Fechar',
    terminal: 'Terminal',
    problems: 'Problemas',
    output: 'Saída',
    command: 'Comando do terminal',
    palette: 'Paleta de comandos',
    paletteHint: 'Buscar arquivos e comandos',
    paletteButton: 'Ir para arquivo',
    noResults: 'Nada encontrado',
    clear: 'Terminal: limpar',
    runDev: 'Terminal: npm run dev',
    goTo: 'Abrir',
    whereTo: 'Onde ir',
    tip: 'Dica: ⌘P ou Ctrl+P abre qualquer arquivo. O terminal aceita help.',
    allProjects: 'todos',
    readBlog: 'Ler o blog',
    fullStory: 'Ver a trajetória completa',
    blogLead: 'O que aprendo construindo produto com IA, escrito para quem também constrói.',
    help: 'Comandos: ls, cat <arquivo>, open <arquivo>, npm run dev, npm test, git log, whoami, clear, exit',
    notFound: (command: string) => `zsh: comando não encontrado: ${command}`,
    noFile: (file: string) => `cat: ${file}: arquivo não encontrado`,
    tests: '✓ 5 arquivos, todos os testes passaram',
    whoami: 'ranielli, engenheiro de produto',
    waMessage: 'Olá! Vim pelo IDE do site do Ranielli.',
    labels: { about: 'Sobre mim', projects: 'Projetos', blog: 'Blog', contact: 'Contato' },
    files: { about: 'sobre.md', projects: 'projetos.json', contact: 'contato.ts' },
    keys: {
      summary: 'resumo',
      url: 'url',
      email: 'email',
      whatsapp: 'whatsappAtto',
      form: 'formulario',
    },
  },
  en: {
    explorer: 'Explorer',
    editor: 'Editor',
    openFile: 'Open',
    closeTab: 'Close',
    terminal: 'Terminal',
    problems: 'Problems',
    output: 'Output',
    command: 'Terminal command',
    palette: 'Command palette',
    paletteHint: 'Search files and commands',
    paletteButton: 'Go to file',
    noResults: 'No results',
    clear: 'Terminal: clear',
    runDev: 'Terminal: npm run dev',
    goTo: 'Open',
    whereTo: 'Where to go',
    tip: 'Tip: ⌘P or Ctrl+P opens any file. The terminal takes help.',
    allProjects: 'all',
    readBlog: 'Read the blog',
    fullStory: 'See the full career',
    blogLead: 'What I learn building products with AI, written for people who build too.',
    help: 'Commands: ls, cat <file>, open <file>, npm run dev, npm test, git log, whoami, clear, exit',
    notFound: (command: string) => `zsh: command not found: ${command}`,
    noFile: (file: string) => `cat: ${file}: no such file`,
    tests: '✓ 5 files, all tests passed',
    whoami: 'ranielli, product engineer',
    waMessage: 'Hi! I came from the IDE on Ranielli’s site.',
    labels: { about: 'About me', projects: 'Projects', blog: 'Blog', contact: 'Contact' },
    files: { about: 'about.md', projects: 'projects.json', contact: 'contact.ts' },
    keys: {
      summary: 'summary',
      url: 'url',
      email: 'email',
      whatsapp: 'attoWhatsapp',
      form: 'form',
    },
  },
  es: {
    explorer: 'Explorador',
    editor: 'Editor',
    openFile: 'Abrir',
    closeTab: 'Cerrar',
    terminal: 'Terminal',
    problems: 'Problemas',
    output: 'Salida',
    command: 'Comando de la terminal',
    palette: 'Paleta de comandos',
    paletteHint: 'Buscar archivos y comandos',
    paletteButton: 'Ir a un archivo',
    noResults: 'Sin resultados',
    clear: 'Terminal: limpiar',
    runDev: 'Terminal: npm run dev',
    goTo: 'Abrir',
    whereTo: 'A dónde ir',
    tip: 'Consejo: ⌘P o Ctrl+P abre cualquier archivo. La terminal acepta help.',
    allProjects: 'todos',
    readBlog: 'Leer el blog',
    fullStory: 'Ver la trayectoria completa',
    blogLead: 'Lo que aprendo construyendo producto con IA, escrito para quien también construye.',
    help: 'Comandos: ls, cat <archivo>, open <archivo>, npm run dev, npm test, git log, whoami, clear, exit',
    notFound: (command: string) => `zsh: comando no encontrado: ${command}`,
    noFile: (file: string) => `cat: ${file}: no existe el archivo`,
    tests: '✓ 5 archivos, todas las pruebas pasaron',
    whoami: 'ranielli, ingeniero de producto',
    waMessage: '¡Hola! Vengo del IDE del sitio de Ranielli.',
    labels: { about: 'Sobre mí', projects: 'Proyectos', blog: 'Blog', contact: 'Contacto' },
    files: { about: 'sobre.md', projects: 'proyectos.json', contact: 'contacto.ts' },
    keys: {
      summary: 'resumen',
      url: 'url',
      email: 'email',
      whatsapp: 'whatsappAtto',
      form: 'formulario',
    },
  },
}

export type IdeCopy = (typeof copy)['pt']

export function getIdeCopy(locale: string): IdeCopy {
  return copy[locale === 'en' || locale === 'es' ? locale : 'pt']
}

/** The five files of the portfolio, written as the code they would be. */
export function getIdeFiles(locale: string): IdeFile[] {
  const t = getIdeCopy(locale)
  const bio = getWorldBio(locale)
  const lines = WORLD_PROJECT_LINES[locale === 'en' || locale === 'es' ? locale : 'pt']
  const listed = WORLD_PROJECTS.filter((project) => project.href)
  const k = t.keys

  return [
    {
      name: 'README.md',
      language: 'Markdown',
      route: '/',
      lines: [
        '# Ranielli Montagna',
        '',
        bio.lead,
        '',
        `## ${t.whereTo}`,
        '',
        `- [${t.labels.about}](/#about)`,
        `- [${t.labels.projects}](/projects)`,
        `- [${t.labels.blog}](/blog)`,
        `- [${t.labels.contact}](/#contact)`,
        '',
        `> ${t.tip}`,
      ],
    },
    {
      name: t.files.about,
      language: 'Markdown',
      route: '/#about',
      lines: [`# ${t.labels.about}`, '', bio.lead, '', bio.detail, '', `[${t.fullStory}](/#about)`],
    },
    {
      name: t.files.projects,
      language: 'JSON',
      route: '/projects',
      lines: [
        '{',
        ...listed.flatMap((project) => [
          `  "${project.slug}": {`,
          `    "${k.summary}": "${lines[project.slug]}",`,
          `    "${k.url}": "${project.href}"`,
          '  },',
        ]),
        `  "${t.allProjects}": "/projects"`,
        '}',
      ],
    },
    {
      name: 'blog.mdx',
      language: 'MDX',
      route: '/blog',
      lines: ['---', 'title: "Blog"', '---', '', t.blogLead, '', `[${t.readBlog}](/blog)`],
    },
    {
      name: t.files.contact,
      language: 'TypeScript',
      route: '/#contact',
      lines: [
        `export const ${t.files.contact.replace('.ts', '')} = {`,
        `  ${k.email}: "mailto:contato@ranimontagna.com",`,
        `  ${k.whatsapp}: "${attoWhatsappHref(t.waMessage)}",`,
        `  ${k.form}: "/#contact",`,
        '} as const',
      ],
    },
  ]
}
