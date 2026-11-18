import { easterCountdown } from '../countdown'

const at = (m: number, d: number) => new Date(2027, m - 1, d, 12)

it('counts the days to Easter Sunday', () => {
  expect(easterCountdown(at(3, 21), 2027)).toEqual({ kind: 'days', days: 7 })
  expect(easterCountdown(at(3, 27), 2027)).toEqual({ kind: 'days', days: 1 })
})

it('wishes a happy Easter on Sunday and still on Monday, never "0 days"', () => {
  expect(easterCountdown(at(3, 28), 2027)).toEqual({ kind: 'easter' })
  expect(easterCountdown(at(3, 29), 2027)).toEqual({ kind: 'easter' })
})
