/**
 * The Summer Triangle as a cloud of star dust, with Vega as the bright vertex.
 * Pure functions so the motion can be tested without a canvas. Units live in a
 * ~170 px frame centered on (0, 0).
 */
export const VEGA_VERTICES = [
  { x: -60, y: -42 },
  { x: 64, y: -52 },
  { x: 22, y: 62 },
] as const

export type Particle = {
  hx: number
  hy: number
  hz: number
  x: number
  y: number
  z: number
  size: number
  alpha: number
  star: boolean
  ang: number
  rad: number
  speed: number
}

const CLUSTER_SHARE = 0.35
const CLUSTER_RADIUS = 8
const EDGE_JITTER = 4
const DEPTH = 18
const EASE = 0.06
const PERSPECTIVE = 300

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function particle(
  rand: () => number,
  hx: number,
  hy: number,
  star: boolean,
  cluster: boolean,
): Particle {
  const hz = star ? 0 : (rand() * 2 - 1) * DEPTH
  return {
    hx,
    hy,
    hz,
    x: hx,
    y: hy,
    z: hz,
    size: star ? 3.2 : (cluster ? 0.9 : 0.6) + rand() * 1.3,
    alpha: star ? 1 : 0.35 + rand() * 0.6,
    star,
    ang: rand() * Math.PI * 2,
    rad: 30 + rand() * 70,
    speed: 0.6 + rand() * 0.8,
  }
}

export function createParticles(count: number, seed: number): Particle[] {
  const rand = mulberry32(seed)
  const particles: Particle[] = []
  if (count <= 0) return particles

  particles.push(particle(rand, VEGA_VERTICES[0].x, VEGA_VERTICES[0].y, true, true))

  for (let i = 1; i < count; i++) {
    if (rand() < CLUSTER_SHARE) {
      const v = VEGA_VERTICES[Math.floor(rand() * 3)]
      const r = rand() * CLUSTER_RADIUS
      const a = rand() * Math.PI * 2
      particles.push(particle(rand, v.x + Math.cos(a) * r, v.y + Math.sin(a) * r, false, true))
      continue
    }
    const from = Math.floor(rand() * 3)
    const a = VEGA_VERTICES[from]
    const b = VEGA_VERTICES[(from + 1) % 3]
    const u = rand()
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    const off = (rand() * 2 - 1) * EDGE_JITTER
    particles.push(
      particle(
        rand,
        a.x + dx * u + (-dy / len) * off,
        a.y + dy * u + (dx / len) * off,
        false,
        false,
      ),
    )
  }

  return particles
}

/** One frame: drift into a swirl while thinking, or settle back on the triangle. */
export function stepParticles(particles: Particle[], mode: 'rest' | 'think'): void {
  for (const p of particles) {
    let tx = p.hx
    let ty = p.hy
    let tz = p.hz
    if (mode === 'think') {
      p.ang += 0.05 * p.speed
      tx = Math.cos(p.ang) * p.rad
      ty = Math.sin(p.ang) * p.rad * 0.6
      tz = Math.sin(p.ang) * 10
    }
    p.x += (tx - p.x) * EASE
    p.y += (ty - p.y) * EASE
    p.z += (tz - p.z) * EASE
  }
}

/** Slow sway in 3D: rotateY = sin(t·0.8)·0.6, rotateX = 0.25, with perspective. */
export function project(
  p: Particle,
  t: number,
  scale: number,
): { sx: number; sy: number; depth: number } {
  const ay = Math.sin(t * 0.8) * 0.6
  const ax = 0.25
  const x1 = p.x * Math.cos(ay) + p.z * Math.sin(ay)
  const z1 = -p.x * Math.sin(ay) + p.z * Math.cos(ay)
  const y1 = p.y * Math.cos(ax) - z1 * Math.sin(ax)
  const z2 = p.y * Math.sin(ax) + z1 * Math.cos(ax)
  const depth = PERSPECTIVE / (PERSPECTIVE + z2)
  return { sx: x1 * depth * scale, sy: y1 * depth * scale, depth }
}
