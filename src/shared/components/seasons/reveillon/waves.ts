/**
 * "Jump the 7 waves": the game's rules, with no DOM. Positions are shares of the stage
 * width; the waves come from the right towards the jumper.
 */

export const WISH_COUNT = 7
export const PLAYER_X = 0.22
export const JUMP_MS = 700
const BASE_SPEED = 0.34 // stage widths per second
const SLOWEST = BASE_SPEED * 0.5
const SPAWN_AT = 1.08
const SPAWN_GAP = 0.62
/** High enough to clear a wave: a generous window of about half a second per jump. */
const CLEAR_HEIGHT = 0.35

export type Wave = { x: number; done: boolean }
export type WavesState = {
  waves: Wave[]
  t: number
  jumpAt: number | null
  cleared: number
  misses: number
  speed: number
}

export function createWaves(cleared: number): WavesState {
  return {
    waves: cleared >= WISH_COUNT ? [] : [{ x: SPAWN_AT, done: false }],
    t: 0,
    jumpAt: null,
    cleared: Math.min(cleared, WISH_COUNT),
    misses: 0,
    speed: BASE_SPEED,
  }
}

/** 0 on the sand, 1 at the top of the jump. */
export function jumpHeight(state: WavesState): number {
  if (state.jumpAt === null) return 0
  const progress = (state.t - state.jumpAt) / JUMP_MS
  return progress >= 0 && progress < 1 ? Math.sin(Math.PI * progress) : 0
}

/** Starts a jump; false while already in the air or once all seven are done. */
export function jump(state: WavesState): boolean {
  if (state.cleared >= WISH_COUNT || jumpHeight(state) > 0) return false
  state.jumpAt = state.t
  return true
}

/** Moves the sea by `dt` ms. A wave reaching the jumper is cleared in the air, missed on the sand. */
export function stepWaves(state: WavesState, dt: number): 'cleared' | 'missed' | null {
  state.t += dt
  let outcome: 'cleared' | 'missed' | null = null
  for (const wave of state.waves) {
    const before = wave.x
    wave.x -= (state.speed * dt) / 1000
    if (wave.done || before <= PLAYER_X || wave.x > PLAYER_X) continue
    wave.done = true
    outcome = jumpHeight(state) > CLEAR_HEIGHT ? 'cleared' : 'missed'
  }
  if (outcome === 'cleared') {
    state.cleared = Math.min(WISH_COUNT, state.cleared + 1)
    state.misses = 0
  } else if (outcome === 'missed') {
    state.misses += 1
    // Two in a row got away: the sea calms down a little.
    if (state.misses >= 2) {
      state.speed = Math.max(SLOWEST, state.speed * 0.75)
      state.misses = 0
    }
  }
  state.waves = state.waves.filter((wave) => wave.x > -0.2)
  const last = state.waves.at(-1)
  if (state.cleared < WISH_COUNT && (!last || last.x < SPAWN_AT - SPAWN_GAP)) {
    state.waves.push({ x: SPAWN_AT, done: false })
  }
  return outcome
}

/** The saved count for an edition, 0 to 7. */
export function wavesKey(edition: number): string {
  return `season-waves:reveillon-${edition}`
}

export function loadCleared(edition: number): number {
  try {
    const value = Number(localStorage.getItem(wavesKey(edition)))
    return Number.isInteger(value) ? Math.min(WISH_COUNT, Math.max(0, value)) : 0
  } catch {
    return 0
  }
}

export function saveCleared(edition: number, cleared: number): void {
  try {
    localStorage.setItem(wavesKey(edition), String(cleared))
  } catch {
    // The game still works for this visit.
  }
}
