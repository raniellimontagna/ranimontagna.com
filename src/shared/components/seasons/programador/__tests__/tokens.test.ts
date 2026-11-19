import {
  burstTokens,
  createTokens,
  MAX_TOKENS,
  stepTokens,
  TOKENS,
  tokenOpacity,
  tokensCount,
} from '../tokens'

it('keeps it light: fewer on phones, within bounds', () => {
  expect(tokensCount(1280, 800, false)).toBe(17)
  expect(tokensCount(3840, 2160, false)).toBe(18)
  expect(tokensCount(390, 844, true)).toBe(6)
  expect(tokensCount(1024, 1366, true)).toBe(10)
})

it('writes only code tokens, 0x100 among them', () => {
  expect(TOKENS).toContain('0x100')
  for (const t of createTokens(40, 800, 600, Math.random)) expect(TOKENS).toContain(t.text)
})

it('rises, and is born again below the screen once it leaves the top', () => {
  const [one] = createTokens(1, 800, 600, () => 0.5)
  const before = one.y
  stepTokens([one], 16, 800, 600, null, () => 0.5)
  expect(one.y).toBeLessThan(before)

  one.y = -30
  const [reborn] = stepTokens([one], 16, 800, 600, null, () => 0.5)
  expect(reborn.y).toBeGreaterThan(600)
})

it('slides away from the pointer', () => {
  const [t] = createTokens(1, 800, 600, () => 0.5)
  t.x = 400
  t.y = 400
  stepTokens([t], 16, 800, 600, { x: 380, y: 400 }, () => 0.5)
  expect(t.vx).toBeGreaterThan(0)
})

it('throws eight tokens out from a point, which fade and are dropped', () => {
  const thrown = burstTokens([], 300, 200, Math.random)
  expect(thrown).toHaveLength(8)
  for (const t of thrown) {
    expect(t.burst).toBe(true)
    expect(Math.hypot(t.x - 300, t.y - 200)).toBeLessThan(1)
  }
  let left = thrown
  const first = tokenOpacity(left[0], 600)
  left = stepTokens(left, 400, 800, 600, null, Math.random)
  expect(tokenOpacity(left[0], 600)).toBeLessThan(first)
  for (let i = 0; i < 10; i++) left = stepTokens(left, 200, 800, 600, null, Math.random)
  expect(left).toHaveLength(0)
})

it('never holds more than the cap, dropping the oldest thrown tokens first', () => {
  let tokens = createTokens(18, 1280, 800, Math.random)
  for (let i = 0; i < 6; i++) tokens = burstTokens(tokens, i * 100, 10, Math.random)
  expect(tokens).toHaveLength(MAX_TOKENS)
  expect(tokens.filter((t) => !t.burst)).toHaveLength(18)
  // 22 thrown tokens fit: the last two bursts whole, six of the fourth, none of the first three.
  const fromBurst = (i: number) => tokens.filter((t) => t.burst && t.x === i * 100).length
  expect([0, 1, 2, 3, 4, 5].map(fromBurst)).toEqual([0, 0, 0, 6, 8, 8])
})

it('fades in from the bottom and out towards the top', () => {
  const [t] = createTokens(1, 800, 600, () => 0.5)
  t.y = 300
  const middle = tokenOpacity(t, 600)
  t.y = 610
  expect(tokenOpacity(t, 600)).toBeLessThan(middle)
  t.y = 10
  expect(tokenOpacity(t, 600)).toBeLessThan(middle)
  expect(middle).toBe(1)
})
