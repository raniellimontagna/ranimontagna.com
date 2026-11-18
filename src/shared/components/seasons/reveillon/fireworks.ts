/** Fireworks physics, in CSS pixels and milliseconds. No DOM here. */

type Point = { x: number; y: number }

export type Rocket = { from: Point; to: Point; age: number; flight: number; color: number }
export type Spark = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  color: number
}
export type Fireworks = { rockets: Rocket[]; sparks: Spark[] }

export const MAX_ROCKETS = 6
export const MAX_SPARKS = 420
const GRAVITY = 0.00018 // px/ms²
const DRAG = 0.985 // per 16 ms
const SPARKS_PER_BURST = 64

export function createFireworks(): Fireworks {
  return { rockets: [], sparks: [] }
}

export function isIdle(state: Fireworks): boolean {
  return state.rockets.length === 0 && state.sparks.length === 0
}

/** Sends a rocket from `from` to burst at `to`; false when the sky is full. */
export function launch(state: Fireworks, from: Point, to: Point, color: number): boolean {
  if (state.rockets.length >= MAX_ROCKETS) return false
  const distance = Math.hypot(to.x - from.x, to.y - from.y)
  const flight = Math.min(1300, Math.max(600, distance * 1.4))
  state.rockets.push({ from, to, age: 0, flight, color })
  return true
}

/** Where a rocket is now: fast off the ground, slowing as it reaches the top. */
export function rocketAt(rocket: Rocket): Point {
  const t = Math.min(1, rocket.age / rocket.flight)
  const eased = 1 - (1 - t) ** 3
  return {
    x: rocket.from.x + (rocket.to.x - rocket.from.x) * eased,
    y: rocket.from.y + (rocket.to.y - rocket.from.y) * eased,
  }
}

/** A round burst of sparks; the oldest sparks go first when there are too many. */
export function burst(
  state: Fireworks,
  x: number,
  y: number,
  color: number,
  count: number,
  rand: () => number,
): void {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rand() * 0.2
    const speed = 0.06 + rand() * 0.16
    const max = 900 + rand() * 700
    state.sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: max,
      max,
      // Mostly the burst's own colour, a few of the next one for sparkle.
      color: rand() < 0.8 ? color : color + 1,
    })
  }
  if (state.sparks.length > MAX_SPARKS) state.sparks.splice(0, state.sparks.length - MAX_SPARKS)
}

/** Moves everything by `dt` ms; a rocket that arrives bursts. */
export function stepFireworks(state: Fireworks, dt: number, rand: () => number): Rocket[] {
  const arrived: Rocket[] = []
  for (const rocket of state.rockets) {
    rocket.age += dt
    if (rocket.age >= rocket.flight) arrived.push(rocket)
  }
  if (arrived.length) {
    state.rockets = state.rockets.filter((rocket) => !arrived.includes(rocket))
    for (const rocket of arrived) {
      burst(state, rocket.to.x, rocket.to.y, rocket.color, SPARKS_PER_BURST, rand)
    }
  }
  const drag = DRAG ** (dt / 16)
  for (const spark of state.sparks) {
    spark.vy += GRAVITY * dt
    spark.vx *= drag
    spark.vy *= drag
    spark.x += spark.vx * dt
    spark.y += spark.vy * dt
    spark.life -= dt
  }
  state.sparks = state.sparks.filter((spark) => spark.life > 0)
  return arrived
}

/** A burst point away from the text: high in the sky, or in a side margin. */
export function ambientTarget(width: number, height: number, rand: () => number): Point {
  if (rand() < 0.6) {
    return { x: width * (0.1 + rand() * 0.8), y: height * (0.06 + rand() * 0.27) }
  }
  const left = rand() < 0.5
  const x = left ? width * (0.03 + rand() * 0.14) : width * (0.83 + rand() * 0.14)
  return { x, y: height * (0.1 + rand() * 0.5) }
}

const INTERACTIVE =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [tabindex], [contenteditable], dialog, [data-no-fireworks]'

/** A click there may launch a firework: plain page space, no text being selected. */
export function isEmptySpot(target: Element | null, selection: string): boolean {
  if (!target || selection.trim()) return false
  return !target.closest(INTERACTIVE)
}
