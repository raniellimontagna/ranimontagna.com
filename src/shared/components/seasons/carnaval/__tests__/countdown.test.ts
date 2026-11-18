import { carnavalCountdown } from '../countdown'

const at = (m: number, d: number) => new Date(2027, m - 1, d, 12)

it('counts the days to the Saturday of Carnival', () => {
  expect(carnavalCountdown(at(1, 30), 2027)).toEqual({ kind: 'days', days: 7 })
  expect(carnavalCountdown(at(2, 5), 2027)).toEqual({ kind: 'days', days: 1 })
})

it('is Carnival from Saturday to Tuesday', () => {
  expect(carnavalCountdown(at(2, 6), 2027)).toEqual({ kind: 'carnaval' })
  expect(carnavalCountdown(at(2, 9), 2027)).toEqual({ kind: 'carnaval' })
})

it('says it is over on Ash Wednesday, never "0 days"', () => {
  expect(carnavalCountdown(at(2, 10), 2027)).toEqual({ kind: 'ashes' })
})
