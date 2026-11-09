/**
 * The case screens as pre-sized static copies of their masters (the
 * captures in /redesign/cases/v1), in AVIF and WebP. Plain files are cached
 * at the CDN edge and survive deploys; /_next/image went back to the origin
 * on every request and started cold after each deploy. Regenerate them with
 * `pnpm cases:stills`; a changed master goes to a new version
 * folder, since the copies are cached for a year.
 */

export type StillKind = 'desk' | 'phone'
export type StillSources = { avif: string; webp: string; src: string }

/** Desk frames run from a phone's 90vw (3×) to a retina laptop's 60vw. */
export const DESK_WIDTHS = [640, 1080, 1600, 2400] as const
/** Phone frames are a fifth of a laptop or under half a phone screen. */
export const PHONE_WIDTHS = [320, 480, 720] as const

const STILLS_DIR = '/redesign/cases/v1/sized'
const FALLBACK = { desk: 1600, phone: 480 } as const

const nameOf = (master: string) =>
  master
    .split('/')
    .pop()
    ?.replace(/\.webp$/, '') ?? master
const widthsOf = (kind: StillKind): readonly number[] =>
  kind === 'desk' ? DESK_WIDTHS : PHONE_WIDTHS
const fileFor = (name: string, width: number, ext: 'avif' | 'webp') =>
  `${STILLS_DIR}/${name}-${width}.${ext}`

export function stillSources(master: string, kind: StillKind): StillSources {
  const name = nameOf(master)
  const set = (ext: 'avif' | 'webp') =>
    widthsOf(kind)
      .map((width) => `${fileFor(name, width, ext)} ${width}w`)
      .join(', ')
  return { avif: set('avif'), webp: set('webp'), src: fileFor(name, FALLBACK[kind], 'webp') }
}

const ALL_WIDTHS = [...new Set([...DESK_WIDTHS, ...PHONE_WIDTHS])].sort((a, b) => a - b)

/** The next.config header rule for exactly these copies: a year, immutable, no 404s. */
export const STILLS_CACHE_SOURCE = `${STILLS_DIR}/:name([a-z-]+)-:width(${ALL_WIDTHS.join('|')}).:ext(avif|webp)`
