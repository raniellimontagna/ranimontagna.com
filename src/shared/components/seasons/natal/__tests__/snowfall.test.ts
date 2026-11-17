import { createFlakes, type Flake, flakeCount, stepFlakes } from '../snowfall'

const flake = (over: Partial<Flake> = {}): Flake => ({
  x: 100,
  y: 100,
  r: 2,
  vy: 30,
  drift: 0,
  phase: 0,
  alpha: 0.5,
  ...over,
})

describe('flakeCount', () => {
  it('scales with the screen area', () => {
    expect(flakeCount(1280, 800, false)).toBe(73)
  })

  it('keeps a floor on small touch screens', () => {
    expect(flakeCount(390, 844, true)).toBe(24)
  })

  it('caps big screens', () => {
    expect(flakeCount(4000, 3000, false)).toBe(140)
    expect(flakeCount(4000, 3000, true)).toBe(70)
  })
})

describe('createFlakes', () => {
  it('makes small, translucent flakes spread over the screen', () => {
    const flakes = createFlakes(50, 800, 600, () => 0.5)
    expect(flakes).toHaveLength(50)
    for (const f of flakes) {
      expect(f.r).toBeGreaterThanOrEqual(0.8)
      expect(f.r).toBeLessThanOrEqual(2.6)
      expect(f.alpha).toBeGreaterThanOrEqual(0.35)
      expect(f.alpha).toBeLessThanOrEqual(0.8)
      expect(f.vy).toBeGreaterThanOrEqual(18)
      expect(f.vy).toBeLessThanOrEqual(55)
      expect(f.x).toBeLessThanOrEqual(800)
      expect(f.y).toBeLessThanOrEqual(600)
    }
  })
})

describe('stepFlakes', () => {
  it('falls by its speed', () => {
    const flakes = [flake()]
    stepFlakes(flakes, 1000, 800, 600, null)
    expect(flakes[0].y).toBeCloseTo(130)
  })

  it('moves away from the pointer', () => {
    const flakes = [flake()]
    stepFlakes(flakes, 16, 800, 600, { x: 110, y: 100 })
    expect(flakes[0].x).toBeLessThan(100)
  })

  it('ignores a far pointer', () => {
    const flakes = [flake()]
    stepFlakes(flakes, 16, 800, 600, { x: 400, y: 400 })
    expect(flakes[0].x).toBe(100)
  })

  it('starts again at the top after leaving the bottom', () => {
    const flakes = [flake({ y: 603 })]
    stepFlakes(flakes, 16, 800, 600, null, () => 0.25)
    expect(flakes[0].y).toBeLessThanOrEqual(0)
    expect(flakes[0].x).toBe(200)
  })
})
