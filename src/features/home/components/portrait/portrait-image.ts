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

/**
 * The same portrait dressed for each season (see docs/redesign/assets.md): the photo of
 * today with only the season's piece pasted on. Each folder carries its own version.
 */
const SEASON_PORTRAIT_DIRS: Record<SeasonId, string> = {
  natal: '/redesign/portrait/natal-v1',
  reveillon: '/redesign/portrait/reveillon-v1',
  carnaval: '/redesign/portrait/carnaval-v1',
  pascoa: '/redesign/portrait/pascoa-v1',
  junina: '/redesign/portrait/junina-v1',
  halloween: '/redesign/portrait/halloween-v1',
}

function portraitIn(dir: string): PortraitImage {
  const file = (width: number) => `${dir}/photo-${width}.webp`
  return {
    src: file(750),
    srcSet: PORTRAIT_WIDTHS.map((width) => `${file(width)} ${width}w`).join(', '),
    sizes: PORTRAIT_IMAGE.sizes,
  }
}

export const SEASON_PORTRAITS = Object.fromEntries(
  Object.entries(SEASON_PORTRAIT_DIRS).map(([id, dir]) => [id, portraitIn(dir)]),
) as Record<SeasonId, PortraitImage>

/** The Santa-hat photo, also drawn inside the snow globe. */
export const NATAL_PORTRAIT_IMAGE = SEASON_PORTRAITS.natal

/** One cache rule per season folder, like the plain portrait's. */
export const SEASON_PORTRAIT_CACHE_SOURCES = Object.values(SEASON_PORTRAIT_DIRS).map(
  (dir) => `${dir}/photo-:width(${PORTRAIT_WIDTHS.join('|')}).webp`,
)
