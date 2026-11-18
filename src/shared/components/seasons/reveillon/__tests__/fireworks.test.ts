import {
  ambientTarget,
  burst,
  createFireworks,
  isIdle,
  launch,
  MAX_ROCKETS,
  MAX_SPARKS,
  stepFireworks,
} from '../fireworks'

const steady = () => 0.5

describe('launch and burst', () => {
  it('flies a rocket to its target and bursts there', () => {
    const state = createFireworks()
    expect(launch(state, { x: 100, y: 800 }, { x: 300, y: 200 }, 0)).toBe(true)
    expect(isIdle(state)).toBe(false)
    for (let i = 0; i < 200 && state.rockets.length; i++) stepFireworks(state, 16, steady)
    expect(state.rockets).toHaveLength(0)
    expect(state.sparks.length).toBeGreaterThan(20)
    const center = state.sparks.reduce((sum, s) => sum + s.x, 0) / state.sparks.length
    expect(Math.abs(center - 300)).toBeLessThan(60)
  })

  it('lets the sparks fall, fade and leave the sky idle', () => {
    const state = createFireworks()
    burst(state, 300, 200, 1, 60, Math.random)
    const startY = state.sparks.reduce((sum, s) => sum + s.y, 0) / state.sparks.length
    for (let i = 0; i < 30; i++) stepFireworks(state, 16, steady)
    const laterY = state.sparks.reduce((sum, s) => sum + s.y, 0) / state.sparks.length
    expect(laterY).toBeGreaterThan(startY)
    for (let i = 0; i < 400; i++) stepFireworks(state, 16, steady)
    expect(isIdle(state)).toBe(true)
  })

  it('keeps at most six rockets and a bounded number of sparks', () => {
    const state = createFireworks()
    for (let i = 0; i < MAX_ROCKETS; i++) launch(state, { x: 0, y: 800 }, { x: 100, y: 100 }, 0)
    expect(launch(state, { x: 0, y: 800 }, { x: 100, y: 100 }, 0)).toBe(false)
    for (let i = 0; i < 20; i++) burst(state, 100, 100, 0, 80, Math.random)
    expect(state.sparks.length).toBeLessThanOrEqual(MAX_SPARKS)
  })
})

describe('ambientTarget', () => {
  it('keeps the automatic fireworks off the text: high up or in the side margins', () => {
    for (const r of [0, 0.2, 0.4, 0.6, 0.8, 0.99]) {
      let calls = 0
      const rand = () => [r, (r + 0.37) % 1, (r + 0.71) % 1][calls++ % 3]
      const { x, y } = ambientTarget(1280, 800, rand)
      const high = y <= 800 * 0.35
      const side = x <= 1280 * 0.18 || x >= 1280 * 0.82
      expect(high || side).toBe(true)
      expect(y).toBeGreaterThan(0)
    }
  })
})
