import { burstConfetti, confettiCount, createConfetti, MAX_PIECES, stepConfetti } from '../confetti'

const steady = () => 0.5

it('keeps it light: fewer pieces on phones, never above the cap', () => {
  expect(confettiCount(1280, 800, false)).toBe(64)
  expect(confettiCount(3840, 2160, false)).toBe(70)
  expect(confettiCount(390, 844, true)).toBe(21)
  expect(confettiCount(100, 100, true)).toBe(12)
})

it('lets ambient confetti fall and come back at the top', () => {
  let pieces = createConfetti(20, 800, 600, Math.random)
  for (let i = 0; i < 2000; i++) pieces = stepConfetti(pieces, 16, 800, 600, null, Math.random)
  expect(pieces).toHaveLength(20)
  for (const p of pieces) {
    expect(p.y).toBeGreaterThan(-20)
    expect(p.y).toBeLessThan(620)
  }
})

it('throws a burst up, lets it fall and drops it below the page', () => {
  let pieces = burstConfetti([], 400, 300, Math.random)
  expect(pieces).toHaveLength(36)
  pieces = stepConfetti(pieces, 16, 800, 600, null, steady)
  expect(pieces.every((p) => p.y < 300)).toBe(true)
  for (let i = 0; i < 400; i++) pieces = stepConfetti(pieces, 16, 800, 600, null, steady)
  expect(pieces).toHaveLength(0)
})

it('blows nearby pieces away from the pointer', () => {
  const [p] = createConfetti(1, 800, 600, steady)
  p.x = 400
  p.y = 300
  const [moved] = stepConfetti([p], 16, 800, 600, { x: 380, y: 300 }, steady)
  expect(moved.vx).toBeGreaterThan(0)
})

it('never piles up past the cap: the oldest burst pieces go first', () => {
  let pieces = createConfetti(60, 800, 600, Math.random)
  // Each burst thrown from its own x, to tell them apart.
  for (let i = 0; i < 10; i++) pieces = burstConfetti(pieces, i * 10, 300, Math.random)
  expect(pieces).toHaveLength(MAX_PIECES)
  expect(pieces.filter((p) => !p.burst)).toHaveLength(60)
  const kept = new Set(pieces.filter((p) => p.burst).map((p) => p.x))
  expect(kept.has(90)).toBe(true)
  expect(kept.has(0)).toBe(false)
})

it('lets thrown confetti flutter down, not drop like a stone', () => {
  let pieces = burstConfetti([], 400, 300, () => 0.5)
  for (let i = 0; i < 200; i++) pieces = stepConfetti(pieces, 16, 800, 6000, null, () => 0.5)
  for (const p of pieces) expect(p.vy).toBeLessThanOrEqual(p.fall * 4 + 1e-9)
})
