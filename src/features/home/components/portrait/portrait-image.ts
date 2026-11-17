import type { SeasonId } from '@/shared/lib/seasons/seasons'

export type PortraitImage = { src: string; srcSet: string; sizes: string }

/** The master (public/photo.webp) is 1083 px wide, and the copies never upscale. */
export const PORTRAIT_WIDTHS = [384, 640, 750, 828, 1080] as const
/** Bump the version folder when the photo changes: the copies are cached for a year. */
const PORTRAIT_DIR = '/redesign/portrait/v2'
const fileFor = (width: number) => `${PORTRAIT_DIR}/photo-${width}.webp`

/**
 * The opening portrait, the page's LCP image, as pre-sized static copies of
 * /photo.webp. Served as plain files they are cached at the CDN edge;
 * /_next/image went back to the origin on every visit. Regenerate them with
 * the command in docs/redesign/assets.md into a new version folder.
 */
export const PORTRAIT_IMAGE: PortraitImage = {
  src: fileFor(750),
  srcSet: PORTRAIT_WIDTHS.map((width) => `${fileFor(width)} ${width}w`).join(', '),
  // Full width until lg, where the hero splits into two columns.
  sizes: '(max-width: 1023px) 100vw, 50vw',
}

/** The next.config header rule for exactly these files: a year, immutable, no 404s. */
export const PORTRAIT_CACHE_SOURCE = `${PORTRAIT_DIR}/photo-:width(${PORTRAIT_WIDTHS.join('|')}).webp`

/** The same portrait with a Santa hat, for December (see docs/redesign/assets.md). */
const NATAL_PORTRAIT_DIR = '/redesign/portrait/natal-v1'
const natalFileFor = (width: number) => `${NATAL_PORTRAIT_DIR}/photo-${width}.webp`

export const NATAL_PORTRAIT_IMAGE: PortraitImage = {
  src: natalFileFor(750),
  srcSet: PORTRAIT_WIDTHS.map((width) => `${natalFileFor(width)} ${width}w`).join(', '),
  sizes: PORTRAIT_IMAGE.sizes,
}

export const SEASON_PORTRAITS: Partial<Record<SeasonId, PortraitImage>> = {
  natal: NATAL_PORTRAIT_IMAGE,
}

export const NATAL_PORTRAIT_CACHE_SOURCE = `${NATAL_PORTRAIT_DIR}/photo-:width(${PORTRAIT_WIDTHS.join('|')}).webp`
