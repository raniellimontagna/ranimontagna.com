import { buildGlyphGrid, cellSizeFor, coverCrop, glyphFor } from '../glyph-grid'

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
})
