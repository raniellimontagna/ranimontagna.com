import { halloweenCountdown } from '../countdown'

const at = (m: number, d: number) => new Date(2027, m - 1, d, 12)

it('counts the days to Halloween night', () => {
  expect(halloweenCountdown(at(10, 24), 2027)).toEqual({ kind: 'days', days: 7 })
  expect(halloweenCountdown(at(10, 30), 2027)).toEqual({ kind: 'days', days: 1 })
})

it('wishes a happy Halloween on the 31st, never "0 days", and says goodbye after', () => {
  expect(halloweenCountdown(at(10, 31), 2027)).toEqual({ kind: 'halloween' })
  expect(halloweenCountdown(at(11, 1), 2027)).toEqual({ kind: 'after' })
})

it('counts to the edition it previews, months ahead', () => {
  expect(halloweenCountdown(new Date(2026, 10, 18, 12), 2027)).toEqual({ kind: 'days', days: 347 })
})
