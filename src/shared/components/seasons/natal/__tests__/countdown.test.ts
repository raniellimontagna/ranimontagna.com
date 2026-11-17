import { christmasCountdown } from '../countdown'

const at = (month: number, day: number, hour = 12, minute = 0) =>
  new Date(2026, month - 1, day, hour, minute)

it('counts calendar days to Christmas from the start of the season', () => {
  expect(christmasCountdown(at(11, 25, 0, 0))).toEqual({ kind: 'days', days: 30 })
  expect(christmasCountdown(at(12, 1))).toEqual({ kind: 'days', days: 24 })
  expect(christmasCountdown(at(12, 24, 23, 59))).toEqual({ kind: 'days', days: 1 })
})

it('wishes a merry Christmas on the day and happy holidays after', () => {
  expect(christmasCountdown(at(12, 25, 0, 0))).toEqual({ kind: 'christmas' })
  expect(christmasCountdown(at(12, 26, 23, 59))).toEqual({ kind: 'after' })
})
