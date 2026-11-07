import { buildGlyphGrid, cellSizeFor, coverCrop, coverDestination, glyphFor } from '../glyph-grid'

describe('glyph grid', () => {
  it('maps luminance to the ramp', () => {
    expect(glyphFor(0)).toBe(' ')
    expect(glyphFor(0.5)).toBe('+')
    expect(glyphFor(1)).toBe('@')
  })

  it('applies the gain per pixel, keeps row-major order and stores the threshold', () => {
    const px = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255])
    const cells = buildGlyphGrid(px, 2, 1, () => 0.5)
    expect(cells.map((c) => [c.x, c.y])).toEqual([
      [0, 0],
      [1, 0],
    ])
    expect(cells[0].l).toBe(0)
    expect(cells[1].l).toBe(1)
    expect(cells[0].t).toBe(0.5)
  })

  it('crops a tall photo anchored at 20% from the top', () => {
    const c = coverCrop(1000, 2000, 100, 100)
    expect(c.sx).toBe(0)
    expect(c.sw).toBe(1000)
    expect(c.sh).toBeCloseTo(1550)
    expect(c.sy).toBeCloseTo(90)
  })

  it('crops a wide photo centered', () => {
    const c = coverCrop(2000, 1000, 100, 100)
    expect(c.sy).toBe(0)
    expect(c.sh).toBe(1000)
    expect(c.sw).toBeCloseTo(645.16, 1)
    expect(c.sx).toBeCloseTo(677.42, 1)
  })

  it('uses bigger cells on phones', () => {
    expect(cellSizeFor(390)).toEqual({ w: 9, h: 13.95 })
    expect(cellSizeFor(1440)).toEqual({ w: 8, h: 12.4 })
  })
  it('maps the whole photo to a destination rect that shows the tall crop', () => {
    const d = coverDestination(1000, 2000, 100, 100)
    expect(d.dx).toBeCloseTo(0)
    expect(d.dw).toBeCloseTo(100)
    expect(d.dh).toBeCloseTo(129.03, 1)
    expect(d.dy).toBeCloseTo(-5.81, 1)
  })

  it('maps the whole photo to a destination rect that shows the wide crop', () => {
    const d = coverDestination(2000, 1000, 100, 100)
    expect(d.dy).toBeCloseTo(0)
    expect(d.dh).toBeCloseTo(100)
    expect(d.dw).toBeCloseTo(310, 0)
    expect(d.dx).toBeCloseTo(-105, 0)
  })

  it('gives the same destination for a density-corrected size (srcset) as for raw pixels', () => {
    const raw = coverDestination(640, 857, 44, 36)
    const corrected = coverDestination(390, 522.2, 44, 36)
    expect(corrected.dx).toBeCloseTo(raw.dx, 1)
    expect(corrected.dy).toBeCloseTo(raw.dy, 1)
    expect(corrected.dw).toBeCloseTo(raw.dw, 1)
    expect(corrected.dh).toBeCloseTo(raw.dh, 1)
  })
})
