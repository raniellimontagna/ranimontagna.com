/** Bats, in CSS pixels and milliseconds. No DOM here. */

export type Bat = { x: number; y: number; vx: number; vy: number; phase: number; size: number }

const AVOID_RADIUS = 120
const MARGIN = 70

/** A small flight of 2 to 4 bats from one side, high on the screen. */
export function spawnFlight(width: number, height: number, rand: () => number): Bat[] {
  const fromLeft = rand() < 0.5
  const count = 2 + Math.floor(rand() * 3)
  const y = height * (0.08 + rand() * 0.45)
  return Array.from({ length: count }, (_, i) => ({
    x: fromLeft ? -MARGIN - i * 46 : width + MARGIN + i * 46,
    y: y + (rand() - 0.5) * 60,
    vx: (fromLeft ? 1 : -1) * (0.13 + rand() * 0.08),
    vy: (rand() - 0.5) * 0.02,
    phase: rand() * Math.PI * 2,
    size: 14 + rand() * 8,
  }))
}

/** One bat out of a point (the name), up and away. */
export function batFrom(x: number, y: number, rand: () => number): Bat {
  const right = rand() < 0.5
  return { x, y, vx: (right ? 1 : -1) * 0.18, vy: -0.12, phase: 0, size: 18 }
}

/** Flaps, wobbles, veers from the pointer; bats that leave the screen are dropped. */
export function stepBats(
  bats: Bat[],
  dt: number,
  width: number,
  height: number,
  pointer: { x: number; y: number } | null,
): Bat[] {
  const kept: Bat[] = []
  for (const bat of bats) {
    if (pointer) {
      const dx = bat.x - pointer.x
      const dy = bat.y - pointer.y
      const d = Math.hypot(dx, dy)
      if (d > 0 && d < AVOID_RADIUS) {
        const push = 0.0012 * (1 - d / AVOID_RADIUS) * dt
        bat.vx += (dx / d) * push
        bat.vy += (dy / d) * push
      }
    }
    bat.vy *= 0.985
    bat.phase += dt * 0.022
    bat.x += bat.vx * dt
    bat.y += (bat.vy + Math.sin(bat.phase / 3) * 0.02) * dt
    const gone =
      bat.x < -MARGIN * 3 ||
      bat.x > width + MARGIN * 3 ||
      bat.y < -MARGIN ||
      bat.y > height + MARGIN
    if (!gone) kept.push(bat)
  }
  return kept
}

/** How far the wings are up, -1 to 1. */
export function wingLift(bat: Bat): number {
  return Math.sin(bat.phase)
}
