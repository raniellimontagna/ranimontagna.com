export type CaseSlug = 'klick' | 'grimory'

/**
 * One screen of the product, captured whole: desktop at 1440×900 and the
 * phone at 390×844, so a frame of the same shape never crops it. With a
 * video, `src` is the loop's first frame (its poster).
 */
export type CaseMedia = { src: string; video?: string }

/** The same moment on the computer and on the phone. */
export type CaseScreens = { desk: CaseMedia; phone: CaseMedia }

/** Copy lives in messages: cases.<slug>.tour.<id>.{title, body, deskAlt, phoneAlt}. */
export type CaseStep = { id: string; screens: CaseScreens }

export type CaseStudy = {
  slug: CaseSlug
  liveUrl: string
  repoUrl: string | null
  /** Alts: cases.<slug>.heroAlt and cases.<slug>.heroPhoneAlt. */
  hero: CaseScreens
  tour: readonly CaseStep[]
  shareImage: string
  stack: readonly string[]
  /** Commits co-authored by an AI agent, out of all; the date is in messages. */
  commits: { agent: number; total: number }
  next: CaseSlug
}

const DIR = '/redesign/cases/v1'
const still = (name: string): CaseMedia => ({ src: `${DIR}/${name}.webp` })
const loop = (name: string): CaseMedia => ({
  src: `${DIR}/${name}.webp`,
  video: `${DIR}/${name}.mp4`,
})

export const CASES: Record<CaseSlug, CaseStudy> = {
  klick: {
    slug: 'klick',
    liveUrl: 'https://klick.ranimontagna.com',
    repoUrl: 'https://github.com/raniellimontagna/klick',
    hero: { desk: loop('klick-desk-timer'), phone: loop('klick-phone-timer') },
    tour: [
      {
        id: 'evolucao',
        screens: { desk: still('klick-desk-evolucao'), phone: still('klick-phone-evolucao') },
      },
      {
        id: 'trilha',
        screens: { desk: loop('klick-desk-trilha'), phone: still('klick-phone-trilha') },
      },
      {
        id: 'centro',
        screens: { desk: still('klick-desk-centro'), phone: still('klick-phone-centro') },
      },
    ],
    shareImage: `${DIR}/klick-og.jpg`,
    stack: [
      'Svelte 5',
      'TypeScript',
      'Vite',
      'PWA',
      'IndexedDB',
      'cubing.js',
      'Cloudflare Workers',
      'Durable Objects',
      'D1',
      'R2',
    ],
    commits: { agent: 428, total: 429 },
    next: 'grimory',
  },
  grimory: {
    slug: 'grimory',
    liveUrl: 'https://grimory.com.br',
    repoUrl: null,
    hero: { desk: still('grimory-desk-monstro'), phone: still('grimory-phone-ficha') },
    tour: [
      {
        id: 'mesa',
        screens: { desk: still('grimory-desk-mesa'), phone: still('grimory-phone-mesa') },
      },
      {
        id: 'combate',
        screens: { desk: loop('grimory-desk-combate'), phone: loop('grimory-phone-combate') },
      },
      {
        id: 'regras',
        screens: { desk: still('grimory-desk-regras'), phone: still('grimory-phone-regras') },
      },
    ],
    shareImage: `${DIR}/grimory-og.jpg`,
    stack: [
      'React',
      'Vite',
      'TanStack Query',
      'Astro',
      'Cloudflare Workers',
      'D1',
      'Durable Objects',
      'Claude API',
    ],
    commits: { agent: 2328, total: 2495 },
    next: 'klick',
  },
}

export const CASE_SLUGS = Object.keys(CASES) as CaseSlug[]

export function getCase(slug: string): CaseStudy | null {
  return Object.hasOwn(CASES, slug) ? CASES[slug as CaseSlug] : null
}

/** The address shown in the browser frame's bar. */
export function caseHost(study: CaseStudy): string {
  return new URL(study.liveUrl).host
}
