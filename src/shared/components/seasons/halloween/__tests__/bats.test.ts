import { batFrom, spawnFlight, stepBats, wingLift } from '../bats'

it('sends a small flight of two to four bats in from one side', () => {
  for (const r of [0, 0.3, 0.6, 0.99]) {
    const flight = spawnFlight(1280, 800, () => r)
    expect(flight.length).toBeGreaterThanOrEqual(2)
    expect(flight.length).toBeLessThanOrEqual(4)
    const fromLeft = flight[0].vx > 0
    for (const bat of flight) expect(bat.x < 0 || bat.x > 1280).toBe(true)
    expect(flight.every((bat) => bat.vx > 0 === fromLeft)).toBe(true)
  }
})

it('crosses the screen and is gone', () => {
  let bats = spawnFlight(1280, 800, () => 0.2)
  for (let i = 0; i < 80; i++) bats = stepBats(bats, 50, 1280, 800, null)
  expect(bats.length).toBeGreaterThan(0)
  for (let i = 0; i < 2000 && bats.length; i++) bats = stepBats(bats, 50, 1280, 800, null)
  expect(bats).toHaveLength(0)
})

it('veers away from the pointer', () => {
  const bat = { x: 400, y: 300, vx: 0.15, vy: 0, phase: 0, size: 16 }
  const [moved] = stepBats([bat], 16, 1280, 800, { x: 400, y: 340 })
  expect(moved.vy).toBeLessThan(0)
})

it('leaves the name up and away, and flaps', () => {
  const bat = batFrom(200, 300, () => 0.2)
  expect(bat.vy).toBeLessThan(0)
  const lifts = new Set<number>()
  for (let i = 0; i < 20; i++) {
    stepBats([bat], 16, 1280, 800, null)
    lifts.add(Math.sign(wingLift(bat)))
  }
  expect(lifts.size).toBeGreaterThan(1)
})

it('slows its climb the same at 60 and 120 frames a second', () => {
  const at60 = batFrom(200, 300, () => 0.2)
  const at120 = batFrom(200, 300, () => 0.2)
  for (let i = 0; i < 60; i++) stepBats([at60], 16, 1280, 800, null)
  for (let i = 0; i < 120; i++) stepBats([at120], 8, 1280, 800, null)
  expect(Math.abs(at60.y - at120.y)).toBeLessThan(6)
})
