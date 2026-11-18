/** Confetti physics, in CSS pixels and milliseconds. No DOM here. */

export type Piece = {
  x: number
  y: number
  vx: number
  vy: number
  /** Terminal falling speed, px/ms. */
  fall: number
  angle: number
  spin: number
  /** Flutter phase: strips turn over as they fall. */
  phase: number
  size: number
  shape: 'dot' | 'strip'
  color: number
  /** From a click: flies up, falls once and goes. */
  burst: boolean
}

export const MAX_PIECES = 240
export const COLORS = 4
const PUSH_RADIUS = 110
const GRAVITY = 0.0009 // px/ms², for burst pieces
const DRAG = 0.985 // per 16 ms

/** Few enough to read through: about one per 16 000 px², at most 70 (40 on phones). */
export function confettiCount(width: number, height: number, coarse: boolean): number {
  return Math.min(coarse ? 40 : 70, Math.max(12, Math.round((width * height) / 16000)))
}

function piece(x: number, y: number, rand: () => number, burst: boolean): Piece {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    fall: 0.03 + rand() * 0.04,
    angle: rand() * Math.PI * 2,
    spin: (rand() - 0.5) * 0.008,
    phase: rand() * Math.PI * 2,
    size: 5 + rand() * 4,
    shape: rand() < 0.5 ? 'dot' : 'strip',
    color: Math.floor(rand() * COLORS),
    burst,
  }
}

export function createConfetti(count: number, width: number, height: number, rand: () => number) {
  return Array.from({ length: count }, () => {
    const p = piece(rand() * width, rand() * height, rand, false)
    p.vy = p.fall
    return p
  })
}

/** A handful thrown up from (x, y) in a cone; the oldest burst pieces go first when too many. */
export function burstConfetti(
  pieces: Piece[],
  x: number,
  y: number,
  rand: () => number,
  count = 36,
): Piece[] {
  const thrown = Array.from({ length: count }, () => {
    const p = piece(x, y, rand, true)
    const angle = -Math.PI / 2 + (rand() - 0.5) * (Math.PI * 0.7)
    const speed = 0.25 + rand() * 0.35
    p.vx = Math.cos(angle) * speed
    p.vy = Math.sin(angle) * speed
    p.spin *= 3
    return p
  })
  const all = [...pieces, ...thrown]
  let excess = all.length - MAX_PIECES
  return excess > 0 ? all.filter((p) => !(p.burst && excess-- > 0)) : all
}

/**
 * Moves the confetti by `dt` ms. The pointer blows nearby pieces away; ambient pieces
 * that leave the bottom come back at the top, burst pieces are dropped.
 */
export function stepConfetti(
  pieces: Piece[],
  dt: number,
  width: number,
  height: number,
  pointer: { x: number; y: number } | null,
  rand: () => number,
): Piece[] {
  const drag = DRAG ** (dt / 16)
  const kept: Piece[] = []
  for (const p of pieces) {
    if (pointer) {
      const dx = p.x - pointer.x
      const dy = p.y - pointer.y
      const d = Math.hypot(dx, dy)
      if (d > 0 && d < PUSH_RADIUS) {
        const push = 0.02 * (1 - d / PUSH_RADIUS)
        p.vx += (dx / d) * push * dt
        p.vy += (dy / d) * push * dt * 0.5
      }
    }
    if (p.burst) {
      p.vy += GRAVITY * dt
    } else {
      // Back to a gentle fall after a gust.
      p.vy += (p.fall - p.vy) * Math.min(1, 0.002 * dt)
    }
    p.vx *= drag
    p.phase += dt * 0.004
    p.angle += p.spin * dt
    p.x += (p.vx + Math.sin(p.phase) * 0.012) * dt
    p.y += p.vy * dt
    if (p.y > height + 12) {
      if (p.burst) continue
      p.y = -12
      p.x = rand() * width
      p.vx = 0
      p.vy = p.fall
    }
    kept.push(p)
  }
  return kept
}
