import type { Flake } from './snowfall'

const HALF_LIFE_MS = 600
const SWIRL = 140
const LIFT = 60
const FALL = 2

/** How shaken the globe is, 0 to 1: impulses add up and fade by half every 600 ms. */
export function shakeEnergy(previous: number, impulse: number, dtMs: number): number {
  const decayed = previous * 0.5 ** (dtMs / HALF_LIFE_MS)
  return Math.min(1, Math.max(0, decayed + impulse))
}

/**
 * Snow inside the glass, around its center (0, 0). Shaken, it swirls and rises;
 * still, it falls and rests on the glass at the bottom.
 */
export function stepGlobeFlakes(
  flakes: Flake[],
  energy: number,
  dtMs: number,
  radius: number,
): void {
  const dt = dtMs / 1000
  for (const f of flakes) {
    f.phase += dt * (1 + energy * 4)
    const angle = Math.atan2(f.y, f.x)
    f.x += (-Math.sin(angle) * SWIRL * energy + Math.sin(f.phase) * f.drift) * dt
    f.y += (Math.cos(angle) * SWIRL * energy - LIFT * energy + f.vy * FALL * (1 - energy)) * dt

    const limit = radius - f.r
    const distance = Math.hypot(f.x, f.y)
    if (distance > limit) {
      f.x *= limit / distance
      f.y *= limit / distance
    }
  }
}
