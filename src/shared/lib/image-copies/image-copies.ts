import manifest from './copies.json'

/**
 * Site images served as pre-sized static copies of a master, in AVIF and
 * WebP. Plain files with an extension are cached at the Cloudflare edge and
 * keep their cache across deploys; /_next/image went back to the origin on
 * every request and started cold after each deploy. Masters and widths live
 * in copies.json; `pnpm images:copies` writes the copies. A changed master
 * goes to a new version folder, since the copies are cached for a year.
 */

type Preset = { widths: number[]; fallback: number; avif: number; webp: number }
type Master = { preset: keyof typeof manifest.presets; width: number; height: number }

export type ImageCopies = { avif: string; webp: string; src: string; width: number; height: number }

const MASTERS = manifest.masters as Record<string, Master>
const PRESETS = manifest.presets as Record<string, Preset>

export const IMAGE_COPY_MASTERS = Object.keys(MASTERS)

/** `/redesign/scenes/pain-codex.webp` → `redesign-scenes-pain-codex`. */
const nameOf = (master: string) =>
  master
    .replace(/^\//, '')
    .replace(/\.webp$/, '')
    .replaceAll('/', '-')

/** The preset's widths up to the master's, plus the master's own when it falls between. */
function copyWidths(preset: Preset, masterWidth: number): number[] {
  const widths = preset.widths.filter((width) => width <= masterWidth)
  return widths.includes(masterWidth) || preset.widths.every((width) => width <= masterWidth)
    ? widths
    : [...widths, masterWidth]
}

export function copiesOf(master: string): ImageCopies {
  const entry = MASTERS[master]
  const preset = entry && PRESETS[entry.preset]
  if (!entry || !preset) throw new Error(`${master} is not listed in image-copies/copies.json`)
  const name = nameOf(master)
  const widths = copyWidths(preset, entry.width)
  const file = (width: number, ext: string) => `${manifest.dir}/${name}-${width}.${ext}`
  const set = (ext: string) => widths.map((width) => `${file(width, ext)} ${width}w`).join(', ')
  const fallback = widths.includes(preset.fallback)
    ? preset.fallback
    : (widths.at(-1) ?? entry.width)
  return {
    avif: set('avif'),
    webp: set('webp'),
    src: file(fallback, 'webp'),
    width: entry.width,
    height: entry.height,
  }
}

const ALL_WIDTHS = [
  ...new Set(
    Object.values(MASTERS).flatMap((entry) =>
      copyWidths(PRESETS[entry.preset] as Preset, entry.width),
    ),
  ),
].sort((a, b) => a - b)

/** The next.config header rule for exactly these copies: a year, immutable, no 404s. */
export const COPIES_CACHE_SOURCE = `${manifest.dir}/:name([a-z0-9-]+)-:width(${ALL_WIDTHS.join('|')}).:ext(avif|webp)`
