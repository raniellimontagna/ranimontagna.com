export type CaseSlug = 'klick' | 'grimory'

export type CaseImage = { src: string; width: number; height: number; phone?: boolean }

export type CaseStudy = {
  slug: CaseSlug
  liveUrl: string | null
  repoUrl: string | null
  hero: CaseImage
  /** Alt texts live in messages: cases.<slug>.gallery.<index>. */
  gallery: readonly CaseImage[]
  stack: readonly string[]
  next: CaseSlug
}

export const CASES: Record<CaseSlug, CaseStudy> = {
  klick: {
    slug: 'klick',
    liveUrl: 'https://klick.ranimontagna.com',
    repoUrl: 'https://github.com/raniellimontagna/klick',
    hero: { src: '/redesign/products/frame-klick.webp', width: 2000, height: 1250 },
    gallery: [
      { src: '/redesign/products/klick-stats.webp', width: 1600, height: 1000 },
      { src: '/redesign/products/klick-mobile.webp', width: 780, height: 1688, phone: true },
      { src: '/redesign/products/klick-timer.webp', width: 1600, height: 1000 },
    ],
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
    next: 'grimory',
  },
  grimory: {
    slug: 'grimory',
    liveUrl: 'https://grimory.com.br',
    repoUrl: null,
    hero: { src: '/redesign/products/frame-grimory.webp', width: 2000, height: 1250 },
    gallery: [
      { src: '/redesign/products/grimory-mesa.webp', width: 1280, height: 1067 },
      { src: '/redesign/products/grimory-inventory.webp', width: 780, height: 1598, phone: true },
      { src: '/redesign/products/grimory-compendium.webp', width: 1600, height: 1125 },
    ],
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
    next: 'klick',
  },
}

export const CASE_SLUGS = Object.keys(CASES) as CaseSlug[]

export function getCase(slug: string): CaseStudy | null {
  return Object.hasOwn(CASES, slug) ? CASES[slug as CaseSlug] : null
}
