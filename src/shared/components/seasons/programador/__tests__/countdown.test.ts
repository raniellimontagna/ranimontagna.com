import { programadorCountdown } from '../countdown'

it('counts days to day 256, which is 13 September in 2027', () => {
  expect(programadorCountdown(new Date(2027, 8, 8, 9), 2027)).toEqual({ kind: 'days', days: 5 })
  expect(programadorCountdown(new Date(2027, 8, 12, 23, 59), 2027)).toEqual({
    kind: 'days',
    days: 1,
  })
  expect(programadorCountdown(new Date(2027, 8, 13, 0, 1), 2027)).toEqual({ kind: 'day' })
  expect(programadorCountdown(new Date(2027, 8, 14, 12), 2027)).toEqual({ kind: 'after' })
})

it('moves to 12 September in a leap year', () => {
  expect(programadorCountdown(new Date(2028, 8, 12, 12), 2028)).toEqual({ kind: 'day' })
  expect(programadorCountdown(new Date(2028, 8, 13, 12), 2028)).toEqual({ kind: 'after' })
})
