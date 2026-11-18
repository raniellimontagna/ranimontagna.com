import { midnightOf, newYearCountdown, viradaFromParam } from '../countdown'

const at = (y: number, m: number, d: number, h = 12, min = 0) => new Date(y, m - 1, d, h, min)

it('counts calendar days to the new year', () => {
  expect(newYearCountdown(at(2026, 12, 27), 2026)).toEqual({ kind: 'days', days: 5 })
  expect(newYearCountdown(at(2026, 12, 28, 23, 59), 2026)).toEqual({ kind: 'days', days: 4 })
  expect(newYearCountdown(at(2026, 12, 30), 2026)).toEqual({ kind: 'days', days: 2 })
})

it('turns to hours and minutes on the 31st', () => {
  expect(newYearCountdown(at(2026, 12, 31, 19, 48), 2026)).toEqual({
    kind: 'hours',
    hours: 4,
    minutes: 12,
  })
  expect(newYearCountdown(at(2026, 12, 31, 23, 59), 2026)).toEqual({
    kind: 'hours',
    hours: 0,
    minutes: 1,
  })
})

it('wishes the new year from midnight on', () => {
  expect(newYearCountdown(at(2027, 1, 1, 0, 0), 2026)).toEqual({ kind: 'new-year', year: 2027 })
  expect(newYearCountdown(at(2027, 1, 6), 2026)).toEqual({ kind: 'new-year', year: 2027 })
  expect(midnightOf(2026)).toEqual(new Date(2027, 0, 1))
})

it('simulates the virada for a preview, within bounds', () => {
  expect(viradaFromParam('?epoca=reveillon&virada=15', 1000)).toBe(16_000)
  expect(viradaFromParam('?virada=4', 0)).toBeNull()
  expect(viradaFromParam('?virada=121', 0)).toBeNull()
  expect(viradaFromParam('?virada=abc', 0)).toBeNull()
  expect(viradaFromParam('', 0)).toBeNull()
})
