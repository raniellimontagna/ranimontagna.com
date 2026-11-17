import { shakeEnergy, stepGlobeFlakes } from '../globe-physics'
import type { Flake } from '../snowfall'

const flake = (x: number, y: number): Flake => ({
  x,
  y,
  r: 2,
  vy: 18,
  drift: 6,
  phase: 0,
  alpha: 0.8,
})

describe('shakeEnergy', () => {
  it('adds the impulse and caps at 1', () => {
    expect(shakeEnergy(0, 1, 0)).toBe(1)
    expect(shakeEnergy(0.8, 0.8, 0)).toBe(1)
  })

  it('halves every 600 ms', () => {
    expect(shakeEnergy(1, 0, 600)).toBeCloseTo(0.5)
    expect(shakeEnergy(1, 0, 1200)).toBeCloseTo(0.25)
  })
})

describe('stepGlobeFlakes', () => {
  it('never lets a flake leave the glass', () => {
    const flakes = [flake(200, 0)]
    stepGlobeFlakes(flakes, 0, 16, 100)
    expect(Math.hypot(flakes[0].x, flakes[0].y)).toBeLessThanOrEqual(100)
  })

  it('lets the snow settle at the bottom once the shaking stops', () => {
    const flakes = [flake(0, -95), flake(-40, -60), flake(50, -20), flake(10, 30)]
    for (let t = 0; t < 5000; t += 16) stepGlobeFlakes(flakes, 0, 16, 100)
    for (const f of flakes) expect(f.y).toBeGreaterThan(0)
  })

  it('stirs the snow while shaken', () => {
    const flakes = [flake(0, 80)]
    stepGlobeFlakes(flakes, 1, 100, 100)
    expect(flakes[0].x).not.toBe(0)
  })
})
