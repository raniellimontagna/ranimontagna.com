/** Luminance ramp, darkest to brightest. */
export const GLYPH_RAMP = ' .:-=+*#%@'
/** Characters a cell turns into near the pointer: the photo becomes code. */
export const CODE_GLYPHS = '{}[]()<>/=;:+*#$&|_?!'
/** Monospace cells are taller than wide. */
export const CELL_ASPECT = 1.55

const PHONE_MAX_WIDTH = 760
const TALL_PHOTO_ANCHOR = 0.2

export type GlyphCell = { x: number; y: number; l: number; t: number }

export function glyphFor(l: number): string {
  const index = Math.min(GLYPH_RAMP.length - 1, Math.floor(l * GLYPH_RAMP.length))
  return GLYPH_RAMP[Math.max(0, index)]
}

/** Source rectangle that covers a cols × rows grid without distorting the photo. */
export function coverCrop(srcW: number, srcH: number, cols: number, rows: number) {
  const gridRatio = cols / (rows * CELL_ASPECT)
  const photoRatio = srcW / srcH

  if (photoRatio > gridRatio) {
    const sw = srcH * gridRatio
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh: srcH }
  }

  const sh = srcW / gridRatio
  return { sx: 0, sy: (srcH - sh) * TALL_PHOTO_ANCHOR, sw: srcW, sh }
}

/**
 * Destination rect (in grid cells) that shows the cover crop when the WHOLE
 * photo is drawn into it. Drawing without a source rect sidesteps srcset:
 * Chrome reports a density-corrected naturalWidth but crops sources in raw
 * pixels, which shifted the face sideways on phones.
 */
export function coverDestination(srcW: number, srcH: number, cols: number, rows: number) {
  const crop = coverCrop(srcW, srcH, cols, rows)
  const scaleX = cols / crop.sw
  const scaleY = rows / crop.sh
  return { dx: -crop.sx * scaleX, dy: -crop.sy * scaleY, dw: srcW * scaleX, dh: srcH * scaleY }
}

/** One cell per RGBA pixel of a cols × rows downscaled image, row by row. */
export function buildGlyphGrid(
  pixels: Uint8ClampedArray,
  cols: number,
  rows: number,
  random: () => number = Math.random,
): GlyphCell[] {
  const cells: GlyphCell[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4
      const lum = (0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]) / 255
      cells.push({ x, y, l: Math.min(1, lum ** 0.9 * 1.25), t: random() })
    }
  }
  return cells
}

export function cellSizeFor(viewportWidth: number): { w: number; h: number } {
  const w = viewportWidth <= PHONE_MAX_WIDTH ? 9 : 8
  return { w, h: Math.round(w * CELL_ASPECT * 100) / 100 }
}
