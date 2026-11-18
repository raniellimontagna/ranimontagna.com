import { createSparks, glow, sparksCount, stepSparks } from '../sparks'

it('keeps it light: fewer on phones, within bounds', () => {
  expect(sparksCount(1280, 800, false)).toBe(43)
  expect(sparksCount(3840, 2160, false)).toBe(45)
  expect(sparksCount(390, 844, true)).toBe(14)
  expect(sparksCount(100, 100, true)).toBe(10)
})

it('rises, and is born again at the bottom before reaching the top quarter', () => {
  const [one] = createSparks(1, 800, 600, () => 0.5)
  const before = one.y
  stepSparks([one], 16, 800, 600, null, () => 0.5)
  expect(one.y).toBeLessThan(before)

  const sparks = createSparks(30, 800, 600, Math.random)
  for (let i = 0; i < 3000; i++) {
    stepSparks(sparks, 16, 800, 600, null, Math.random)
    for (const s of sparks) expect(s.y).toBeGreaterThanOrEqual(150 - 2)
  }
  expect(sparks).toHaveLength(30)
})

it('slides away from the pointer', () => {
  const [s] = createSparks(1, 800, 600, () => 0.5)
  s.x = 400
  s.y = 400
  stepSparks([s], 16, 800, 600, { x: 380, y: 400 }, () => 0.5)
  expect(s.vx).toBeGreaterThan(0)
})

it('fades with age', () => {
  const [s] = createSparks(1, 800, 600, () => 0.5)
  s.phase = 0
  s.life = s.max
  const young = glow(s)
  s.life = s.max / 4
  expect(glow(s)).toBeLessThan(young)
})
