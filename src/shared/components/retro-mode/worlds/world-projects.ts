/** The projects every world lists, with one line each, in every language. */
export const WORLD_PROJECTS = [
  { slug: 'grimory', name: 'Grimory', href: '/projects/grimory', external: false },
  { slug: 'klick', name: 'Klick', href: '/projects/klick', external: false },
  {
    slug: 'agent-toolkit',
    name: 'agent-toolkit',
    href: 'https://www.npmjs.com/package/@ranimontagna/agent-toolkit',
    external: true,
  },
  { slug: 'argus', name: 'Argus', href: null, external: false },
  { slug: 'atto-read', name: 'Atto Read', href: null, external: false },
] as const

export const WORLD_PROJECT_LINES = {
  pt: {
    grimory: 'Mesa de D&D em português. A IA propõe, as regras validam, o jogador decide.',
    klick: 'Timer de speedcubing offline-first.',
    'agent-toolkit': 'Um comando instala as mesmas ferramentas de IA em cinco agentes.',
    argus: 'Hub de dados pessoal por API, MCP, Discord e CLI.',
    'atto-read': 'Leitor pessoal da Atto, em React Native e Expo.',
  },
  en: {
    grimory: 'A D&D table in Portuguese. The AI proposes, the rules validate, the player decides.',
    klick: 'An offline-first speedcubing timer.',
    'agent-toolkit': 'One command installs the same AI tools in five agents.',
    argus: 'A personal data hub through an API, MCP, Discord and a CLI.',
    'atto-read': "Atto's personal reader, built with React Native and Expo.",
  },
  es: {
    grimory: 'Una mesa de D&D en portugués. La IA propone, las reglas validan, el jugador decide.',
    klick: 'Timer de speedcubing offline-first.',
    'agent-toolkit': 'Un comando instala las mismas herramientas de IA en cinco agentes.',
    argus: 'Hub de datos personal vía API, MCP, Discord y CLI.',
    'atto-read': 'El lector personal de Atto, hecho con React Native y Expo.',
  },
} as const
