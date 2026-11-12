import { createParticles, project, stepParticles, VEGA_VERTICES } from '../vega-particles'

function distToSegment(
  px: number,
  py: number,
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const u = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (a.x + u * dx), py - (a.y + u * dy))
}

describe('vega particles', () => {
  it('creates the requested count with a single star at Vega', () => {
    const particles = createParticles(260, 7)
    expect(particles).toHaveLength(260)
    const stars = particles.filter((p) => p.star)
    expect(stars).toHaveLength(1)
    expect(stars[0]).toMatchObject({ hx: -60, hy: -42 })
  })

  it('is deterministic per seed', () => {
    expect(createParticles(60, 7)).toEqual(createParticles(60, 7))
    expect(createParticles(60, 7)).not.toEqual(createParticles(60, 8))
  })

  it('keeps rest positions near the triangle', () => {
    const [a, b, c] = VEGA_VERTICES
    for (const p of createParticles(260, 3)) {
      const d = Math.min(
        distToSegment(p.hx, p.hy, a, b),
        distToSegment(p.hx, p.hy, b, c),
        distToSegment(p.hx, p.hy, c, a),
      )
      expect(d).toBeLessThanOrEqual(9)
    }
  })

  it('thinking pulls particles toward an orbit and rest brings them back', () => {
    const particles = createParticles(260, 5)
    for (let i = 0; i < 200; i++) stepParticles(particles, 'think')
    const meanRadius =
      particles.reduce((sum, p) => sum + Math.hypot(p.x, p.y / 0.6), 0) / particles.length
    expect(meanRadius).toBeGreaterThan(30)
    expect(meanRadius).toBeLessThan(100)
    for (let i = 0; i < 400; i++) stepParticles(particles, 'rest')
    const meanHome =
      particles.reduce((sum, p) => sum + Math.hypot(p.x - p.hx, p.y - p.hy, p.z - p.hz), 0) /
      particles.length
    expect(meanHome).toBeLessThan(1)
  })

  it('projects with perspective around the center', () => {
    const [p] = createParticles(1, 1)
    const out = project(p, 0, 1)
    expect(Number.isFinite(out.sx)).toBe(true)
    expect(Number.isFinite(out.sy)).toBe(true)
    expect(out.depth).toBeGreaterThan(0)
  })
})
