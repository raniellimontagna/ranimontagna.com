export type PortraitImage = { src: string; srcSet: string; sizes: string }

const WIDTHS = [384, 640, 750, 828, 1080, 1440] as const
const fileFor = (width: number) => `/redesign/portrait/photo-${width}.webp`

/**
 * The opening portrait, the page's LCP image, as pre-sized static copies of
 * /photo.webp. Served as plain files they are cached at the CDN edge;
 * /_next/image went back to the origin on every visit. Regenerate them with
 * the command in docs/redesign/assets.md, under new names, when the photo changes.
 */
export const PORTRAIT_IMAGE: PortraitImage = {
  src: fileFor(750),
  srcSet: WIDTHS.map((width) => `${fileFor(width)} ${width}w`).join(', '),
  sizes: '(max-width: 760px) 100vw, 50vw',
}
