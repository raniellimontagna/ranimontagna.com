/** Bonfire sparks, in CSS pixels and milliseconds. No DOM here. */

export type Spark = {
  x: number
  y: number
  vx: number
  /** Rising speed, px/ms (positive goes up). */
  rise: number
  life: number
  max: number
  r: number
  phase: number
  color: number
}

const AVOID_RADIUS = 90
/** Sparks die out before they reach the top quarter of the screen. */
const CEILING = 0.25

/** Fewer than snow: about one per 24 000 px², at most 45 (25 on phones). */
export function sparksCount(width: number, height: number, coarse: boolean): number {
  return Math.min(coarse ? 25 : 45, Math.max(10, Math.round((width * height) / 24000)))
}

function spark(width: number, height: number, rand: () => number, fresh: boolean): Spark {
  const max = 4000 + rand() * 4000
  return {
    x: rand() * width,
    y: fresh ? height + 6 : height * (CEILING + rand() * (1 - CEILING)),
    vx: 0,
    rise: 0.025 + rand() * 0.035,
    life: fresh ? max : max * rand(),
    max,
    r: 1 + rand() * 1.6,
    phase: rand() * Math.PI * 2,
    color: rand() < 0.65 ? 0 : 1,
  }
}

export function createSparks(count: number, width: number, height: number, rand: () => number) {
  return Array.from({ length: count }, () => spark(width, height, rand, false))
}

/** Sparks drift up and sideways, dodge the pointer and are born again at the bottom. */
export function stepSparks(
  sparks: Spark[],
  dt: number,
  width: number,
  height: number,
  pointer: { x: number; y: number } | null,
  rand: () => number,
): void {
  for (let i = 0; i < sparks.length; i++) {
    const s = sparks[i]
    if (pointer) {
      const dx = s.x - pointer.x
      const dy = s.y - pointer.y
      const d = Math.hypot(dx, dy)
      if (d > 0 && d < AVOID_RADIUS) s.vx += (dx / d) * 0.004 * (1 - d / AVOID_RADIUS) * dt
    }
    s.vx *= 0.96
    s.phase += dt * 0.003
    s.x += (s.vx + Math.sin(s.phase) * 0.01) * dt
    s.y -= s.rise * dt
    s.life -= dt
    if (s.life <= 0 || s.y < height * CEILING) sparks[i] = spark(width, height, rand, true)
  }
}

/** How bright a spark is now: fading with age, flickering a little. */
export function glow(s: Spark): number {
  return Math.max(0, s.life / s.max) * (0.65 + 0.35 * Math.sin(s.phase * 5))
}
