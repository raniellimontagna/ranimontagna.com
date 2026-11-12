export type PortraitImage = { src: string; srcSet: string; sizes: string }

export const PORTRAIT_WIDTHS = [384, 640, 750, 828, 1080, 1440] as const
/** Bump the version folder when the photo changes: the copies are cached for a year. */
const PORTRAIT_DIR = '/redesign/portrait/v1'
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
