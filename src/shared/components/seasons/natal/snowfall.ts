/** Snowflakes as plain data, so the motion is testable without a canvas. */
export type Flake = {
  x: number
  y: number
  r: number
  /** Fall speed, px/s. */
  vy: number
  /** Sideways sway amplitude, px/s. */
  drift: number
  phase: number
  alpha: number
}

const AREA_PER_FLAKE = 14000
const MIN_FLAKES = 24
const MAX_FLAKES = 140
const MAX_TOUCH_FLAKES = 70
const POINTER_RADIUS = 90
const POINTER_PUSH = 220

export function flakeCount(width: number, height: number, coarse: boolean): number {
  const base = Math.floor((width * height) / AREA_PER_FLAKE)
  const scaled = coarse ? Math.floor(base * 0.6) : base
  return Math.max(MIN_FLAKES, Math.min(coarse ? MAX_TOUCH_FLAKES : MAX_FLAKES, scaled))
}

export function createFlakes(
  count: number,
  width: number,
  height: number,
  random: () => number = Math.random,
): Flake[] {
  return Array.from({ length: count }, () => ({
    x: random() * width,
    y: random() * height,
    r: 0.8 + random() * 1.8,
    vy: 18 + random() * 37,
    drift: 4 + random() * 14,
    phase: random() * Math.PI * 2,
    alpha: 0.35 + random() * 0.45,
  }))
}

export function stepFlakes(
  flakes: Flake[],
  dtMs: number,
  width: number,
  height: number,
  pointer: { x: number; y: number } | null,
  random: () => number = Math.random,
): void {
  const dt = dtMs / 1000
  for (const f of flakes) {
    f.phase += dt
    f.y += f.vy * dt
    f.x += Math.sin(f.phase) * f.drift * dt

    if (pointer) {
      const dx = f.x - pointer.x
      const dy = f.y - pointer.y
      const distance = Math.hypot(dx, dy)
      if (distance > 0 && distance < POINTER_RADIUS) {
        const push = (1 - distance / POINTER_RADIUS) * POINTER_PUSH * dt
        f.x += (dx / distance) * push
        f.y += (dy / distance) * push
      }
    }

    if (f.y > height + f.r) {
      f.y = -f.r
      f.x = random() * width
    }
  }
}
