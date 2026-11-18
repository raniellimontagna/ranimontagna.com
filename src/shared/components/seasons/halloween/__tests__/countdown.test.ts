import { halloweenCountdown } from '../countdown'

const at = (m: number, d: number) => new Date(2027, m - 1, d, 12)

it('counts the days to Halloween night', () => {
  expect(halloweenCountdown(at(10, 24))).toEqual({ kind: 'days', days: 7 })
  expect(halloweenCountdown(at(10, 30))).toEqual({ kind: 'days', days: 1 })
})

it('wishes a happy Halloween on the 31st, never "0 days", and says goodbye after', () => {
  expect(halloweenCountdown(at(10, 31))).toEqual({ kind: 'halloween' })
  expect(halloweenCountdown(at(11, 1))).toEqual({ kind: 'after' })
})
