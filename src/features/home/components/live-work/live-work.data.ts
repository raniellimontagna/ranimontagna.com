export type LiveWorkSlug = 'grimory' | 'klick' | 'agent-toolkit' | 'argus' | 'atto-read'

export type LiveWorkItem = {
  slug: LiveWorkSlug
  /** A real capture, or an honestly labelled ambient image. Null draws a type card. */
  image: { src: string } | null
  /** A real command from the project's README, drawn as a terminal card. */
  terminal?: readonly string[]
  /** Null when the project is private and has no public page. */
  href: string | null
  external: boolean
}

export const LIVE_WORK: readonly LiveWorkItem[] = [
  {
    slug: 'grimory',
    image: { src: '/redesign/products/frame-grimory.webp' },
    href: '/projects/grimory',
    external: false,
  },
  {
    slug: 'klick',
    image: { src: '/redesign/products/frame-klick.webp' },
    href: '/projects/klick',
    external: false,
  },
  {
    slug: 'agent-toolkit',
    image: null,
    terminal: [
      '$ npx -y @ranimontagna/agent-toolkit --all --codex',
      '  RTK · Caveman · Superpowers · Graphify · GSD',
      '  every source pinned in tools.lock.json',
      '✓ installed',
    ],
    href: 'https://www.npmjs.com/package/@ranimontagna/agent-toolkit',
    external: true,
  },
  {
    slug: 'argus',
    image: { src: '/redesign/products/frame-argus.webp' },
    href: null,
    external: false,
  },
  {
    slug: 'atto-read',
    image: { src: '/redesign/products/frame-atto-read.webp' },
    href: null,
    external: false,
  },
]
