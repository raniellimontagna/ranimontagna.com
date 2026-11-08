import { getAllPosts } from '@/features/blog/lib/blog'
import { isAllowedCardHref, type VegaCard } from '@/shared/vega/vega-card'
import type { ChatLocale } from './chat.profile'

export type CardEntry = VegaCard & { aliases: string[] }

type FixedCard = Omit<VegaCard, 'title' | 'summary'> & { aliases: string[] }

// The closed list of site destinations. The model never picks these: the
// server matches them in the validated answer.
const FIXED_CARDS: readonly FixedCard[] = [
  {
    id: 'case-klick',
    kind: 'case',
    href: '/projects/klick',
    image: '/redesign/products/klick-timer.webp',
    aliases: ['Klick'],
  },
  {
    id: 'case-grimory',
    kind: 'case',
    href: '/projects/grimory',
    image: '/redesign/products/grimory-mesa.webp',
    aliases: ['Grimory'],
  },
  {
    id: 'section-trajetoria',
    kind: 'section',
    href: '/#trajetoria',
    image: null,
    aliases: [
      'trajetória',
      'trajectory',
      'trayectoria',
      'Luizalabs',
      'Smarten',
      'SBSistemas',
      'Lemon',
    ],
  },
  {
    id: 'section-ia',
    kind: 'section',
    href: '/#ia',
    image: null,
    aliases: ['agent-toolkit', 'SDD', 'spec-driven'],
  },
  { id: 'section-atto', kind: 'section', href: '/#atto', image: null, aliases: ['Atto'] },
  { id: 'section-escrita', kind: 'section', href: '/#escrita', image: null, aliases: [] },
  { id: 'blog', kind: 'page', href: '/blog', image: null, aliases: ['blog'] },
  { id: 'projects', kind: 'page', href: '/projects', image: null, aliases: [] },
]

// Card copy lives here, like the rest of the chat's localized server text.
const CARD_COPY: Record<ChatLocale, Record<string, { title: string; summary: string }>> = {
  pt: {
    'case-klick': {
      title: 'Klick',
      summary: 'Timer de treino que virou app, com o código feito junto com IA',
    },
    'case-grimory': {
      title: 'Grimory',
      summary: 'Mesa de D&D 5e em português: a IA propõe, as regras validam',
    },
    'section-trajetoria': {
      title: 'Trajetória',
      summary: 'De quem escrevia telas a quem conduz o produto inteiro',
    },
    'section-ia': {
      title: 'IA sem amarra, com método',
      summary: 'Os modelos que ele usa e o jeito certo de usar',
    },
    'section-atto': {
      title: 'Atto',
      summary: 'A software house dele, para projetos com escopo e prazo',
    },
    'section-escrita': { title: 'Escrita', summary: 'Os textos mais recentes do blog' },
    blog: { title: 'Blog', summary: 'Tudo o que ele escreveu' },
    projects: { title: 'Projetos', summary: 'Os repositórios públicos' },
  },
  en: {
    'case-klick': {
      title: 'Klick',
      summary: 'A workout timer that became an app, built together with AI',
    },
    'case-grimory': {
      title: 'Grimory',
      summary: 'A D&D 5e table in Portuguese: AI proposes, the rules validate',
    },
    'section-trajetoria': {
      title: 'Career',
      summary: 'From building screens to leading the whole product',
    },
    'section-ia': {
      title: 'AI with no lock-in, with a method',
      summary: 'The models he uses and the right way to use them',
    },
    'section-atto': {
      title: 'Atto',
      summary: 'His software house, for projects with scope and deadline',
    },
    'section-escrita': { title: 'Writing', summary: 'The latest blog posts' },
    blog: { title: 'Blog', summary: 'Everything he has written' },
    projects: { title: 'Projects', summary: 'The public repositories' },
  },
  es: {
    'case-klick': {
      title: 'Klick',
      summary: 'Un temporizador de entrenamiento que se volvió app, hecho junto con IA',
    },
    'case-grimory': {
      title: 'Grimory',
      summary: 'Una mesa de D&D 5e en portugués: la IA propone, las reglas validan',
    },
    'section-trajetoria': {
      title: 'Trayectoria',
      summary: 'De construir pantallas a conducir el producto entero',
    },
    'section-ia': {
      title: 'IA sin ataduras, con método',
      summary: 'Los modelos que usa y la forma correcta de usarlos',
    },
    'section-atto': {
      title: 'Atto',
      summary: 'Su software house, para proyectos con alcance y plazo',
    },
    'section-escrita': { title: 'Escritura', summary: 'Los textos más recientes del blog' },
    blog: { title: 'Blog', summary: 'Todo lo que escribió' },
    projects: { title: 'Proyectos', summary: 'Los repositorios públicos' },
  },
}

async function postCards(locale: ChatLocale): Promise<CardEntry[]> {
  try {
    const posts = await getAllPosts(locale)
    return posts
      .filter((post) => post.metadata.published && /^[a-z0-9-]+$/.test(post.slug))
      .map((post) => ({
        id: `post:${post.slug}`,
        kind: 'post' as const,
        href: `/blog/${post.slug}`,
        title: post.metadata.title,
        summary: post.metadata.description,
        image: null,
        aliases: [post.metadata.title],
      }))
  } catch {
    // Cards are a bonus: a blog outage must never cost the visitor the answer.
    return []
  }
}

export async function buildCardCatalog(locale: ChatLocale): Promise<CardEntry[]> {
  const copy = CARD_COPY[locale] ?? CARD_COPY.pt
  const fixed = FIXED_CARDS.map((card) => ({ ...card, ...copy[card.id] }))
  return [...fixed, ...(await postCards(locale))]
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function firstMention(answer: string, alias: string): number {
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(alias)}(?![\\p{L}\\p{N}])`, 'iu')
  return answer.search(pattern)
}

/** Up to `max` cards for the destinations the answer mentions, in reading order. */
export function pickCards(answer: string, catalog: CardEntry[], max = 2): VegaCard[] {
  return catalog
    .map((entry) => {
      const positions = entry.aliases
        .map((alias) => firstMention(answer, alias))
        .filter((i) => i >= 0)
      return { entry, at: positions.length ? Math.min(...positions) : -1 }
    })
    .filter(({ entry, at }) => at >= 0 && isAllowedCardHref(entry.href))
    .sort((a, b) => a.at - b.at)
    .slice(0, max)
    .map(({ entry: { aliases: _aliases, ...card } }) => card)
}
