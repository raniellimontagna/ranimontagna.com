/** Code tokens drifting up the page, in CSS pixels and milliseconds. No DOM here. */

export const TOKENS = ['{}', '=>', ';', '</>', '0x100', '&&', '()', '[]', '//', '++'] as const

export type Token = {
  x: number
  y: number
  vx: number
  vy: number
  /** Rising speed of an ambient token, px/ms. */
  rise: number
  /** Left of a thrown token's life, ms (ambient tokens live until they leave the top). */
  life: number
  max: number
  text: (typeof TOKENS)[number]
  size: number
  /** Index into the palette: keyword, string, number, function. */
  color: number
  burst: boolean
}

export const MAX_TOKENS = 40
const BURST_COUNT = 8
const AVOID_RADIUS = 110
const OFFSCREEN = 24

/** Sparse on purpose: about one per 60 000 px², at least 6, at most 18 (10 on phones). */
export function tokensCount(width: number, height: number, coarse: boolean): number {
  return Math.min(coarse ? 10 : 18, Math.max(6, Math.round((width * height) / 60000)))
}

function token(width: number, height: number, rand: () => number, fresh: boolean): Token {
  return {
    x: rand() * width,
    y: fresh ? height + OFFSCREEN : rand() * height,
    vx: 0,
    vy: 0,
    rise: 0.012 + rand() * 0.018,
    life: Number.POSITIVE_INFINITY,
    max: Number.POSITIVE_INFINITY,
    text: TOKENS[Math.floor(rand() * TOKENS.length) % TOKENS.length],
    size: 12 + Math.round(rand() * 8),
    color: Math.floor(rand() * 4) % 4,
    burst: false,
  }
}

export function createTokens(
  count: number,
  width: number,
  height: number,
  rand: () => number,
): Token[] {
  return Array.from({ length: count }, () => token(width, height, rand, false))
}

/** A handful thrown out from a click; past the cap, the oldest thrown tokens go first. */
export function burstTokens(tokens: Token[], x: number, y: number, rand: () => number): Token[] {
  const thrown = Array.from({ length: BURST_COUNT }, (_, i) => {
    const t = token(0, 0, rand, false)
    const angle = (i / BURST_COUNT) * Math.PI * 2 + rand() * 0.5
    const speed = 0.12 + rand() * 0.14
    const max = 900 + rand() * 400
    return {
      ...t,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: max,
      max,
      burst: true,
    }
  })
  const all = [...tokens, ...thrown]
  let excess = all.length - MAX_TOKENS
  return excess > 0 ? all.filter((t) => !(t.burst && excess-- > 0)) : all
}

/**
 * Moves the tokens by `dt` ms. Ambient tokens rise, slide away from the pointer and come
 * back below the screen once they leave the top; thrown tokens slow down, fade and go.
 */
export function stepTokens(
  tokens: Token[],
  dt: number,
  width: number,
  height: number,
  pointer: { x: number; y: number } | null,
  rand: () => number,
): Token[] {
  const kept: Token[] = []
  for (let t of tokens) {
    if (t.burst) {
      const drag = 0.97 ** (dt / 16)
      t.vx *= drag
      t.vy *= drag
      t.x += t.vx * dt
      t.y += t.vy * dt
      t.life -= dt
      if (t.life > 0) kept.push(t)
      continue
    }
    if (pointer) {
      const dx = t.x - pointer.x
      const dy = t.y - pointer.y
      const d = Math.hypot(dx, dy)
      if (d > 0 && d < AVOID_RADIUS) t.vx += (dx / d) * 0.003 * (1 - d / AVOID_RADIUS) * dt
    }
    t.vx *= 0.95 ** (dt / 16)
    t.x += t.vx * dt
    t.y -= t.rise * dt
    if (t.y < -OFFSCREEN) t = token(width, height, rand, true)
    kept.push(t)
  }
  return kept
}

/** Thrown tokens fade with age; ambient ones fade in from the bottom and out near the top. */
export function tokenOpacity(t: Token, height: number): number {
  if (t.burst) return Math.max(0, t.life / t.max)
  const fromBottom = (height + OFFSCREEN - t.y) / 160
  const fromTop = (t.y + OFFSCREEN) / (height * 0.25)
  return Math.max(0, Math.min(1, fromBottom, fromTop))
}
