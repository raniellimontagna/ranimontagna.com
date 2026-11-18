import {
  ambientTarget,
  burst,
  createFireworks,
  isEmptySpot,
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

describe('isEmptySpot', () => {
  const make = (html: string) => {
    document.body.innerHTML = html
    return document.body
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it.each([
    ['<a href="/x"><span id="t">link</span></a>'],
    ['<button><span id="t">ok</span></button>'],
    ['<label><input id="t" /></label>'],
    ['<textarea id="t"></textarea>'],
    ['<div role="button" id="t"></div>'],
    ['<div tabindex="0"><span id="t">widget</span></div>'],
    ['<dialog open><p id="t">card</p></dialog>'],
    ['<div data-no-fireworks><p id="t">game</p></div>'],
    ['<div role="dialog"><p id="t">Vega</p></div>'],
    ['<div aria-modal="true"><p id="t">menu</p></div>'],
  ])('is not empty inside %s', (html) => {
    make(html)
    expect(isEmptySpot(document.getElementById('t'), '')).toBe(false)
  })

  it('is empty on plain page space, but not while text is selected', () => {
    make('<main tabindex="-1"><section><p id="t">Texto</p></section></main>')
    const target = document.getElementById('t')
    expect(isEmptySpot(target, '')).toBe(true)
    expect(isEmptySpot(target, 'Texto')).toBe(false)
    expect(isEmptySpot(null, '')).toBe(false)
  })
})
