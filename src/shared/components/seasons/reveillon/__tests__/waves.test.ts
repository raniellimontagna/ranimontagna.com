import {
  createWaves,
  JUMP_MS,
  jump,
  jumpHeight,
  loadCleared,
  saveCleared,
  stepWaves,
  type WavesState,
  WISH_COUNT,
} from '../waves'

/** Steps until the next wave reaches the jumper; returns its outcome. */
function untilWave(state: WavesState, jumpBeforeMs: number | null) {
  for (let i = 0; i < 2000; i++) {
    const next = state.waves.find((wave) => !wave.done)
    if (jumpBeforeMs !== null && next) {
      const msToPlayer = ((next.x - 0.22) / state.speed) * 1000
      if (msToPlayer <= jumpBeforeMs && jumpHeight(state) === 0) jump(state)
    }
    const outcome = stepWaves(state, 10)
    if (outcome) return outcome
  }
  return null
}

afterEach(() => {
  localStorage.clear()
})

it('clears a wave that reaches the jumper in the air', () => {
  const state = createWaves(0)
  expect(untilWave(state, JUMP_MS / 2)).toBe('cleared')
  expect(state.cleared).toBe(1)
})

it('misses a wave that finds the jumper on the sand', () => {
  const state = createWaves(0)
  expect(untilWave(state, null)).toBe('missed')
  expect(state.cleared).toBe(0)
})

it('gives about half a second of slack on each jump', () => {
  expect(untilWave(createWaves(0), 150)).toBe('cleared')
  expect(untilWave(createWaves(0), 550)).toBe('cleared')
  expect(untilWave(createWaves(0), 690)).toBe('missed')
})

it('calms the sea after two misses in a row', () => {
  const state = createWaves(0)
  const start = state.speed
  untilWave(state, null)
  expect(state.speed).toBe(start)
  untilWave(state, null)
  expect(state.speed).toBeLessThan(start)
})

it('stops at seven: no jump and no new wave after the last', () => {
  const state = createWaves(6)
  expect(untilWave(state, JUMP_MS / 2)).toBe('cleared')
  expect(state.cleared).toBe(WISH_COUNT)
  expect(jump(state)).toBe(false)
  for (let i = 0; i < 500; i++) stepWaves(state, 16)
  expect(state.waves.filter((wave) => !wave.done)).toHaveLength(0)
})

it('no double jump while in the air', () => {
  const state = createWaves(0)
  expect(jump(state)).toBe(true)
  stepWaves(state, 100)
  expect(jump(state)).toBe(false)
})

it('saves the count per edition, within 0 to 7', () => {
  expect(loadCleared(2026)).toBe(0)
  saveCleared(2026, 3)
  expect(loadCleared(2026)).toBe(3)
  expect(loadCleared(2027)).toBe(0)
  localStorage.setItem('season-waves:reveillon-2026', '99')
  expect(loadCleared(2026)).toBe(7)
  localStorage.setItem('season-waves:reveillon-2026', 'oops')
  expect(loadCleared(2026)).toBe(0)
})
