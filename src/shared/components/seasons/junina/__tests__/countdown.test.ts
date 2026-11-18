import { juninaCountdown } from '../countdown'

const at = (m: number, d: number) => new Date(2027, m - 1, d, 12)

it('counts the days to São João', () => {
  expect(juninaCountdown(at(6, 1))).toEqual({ kind: 'days', days: 23 })
  expect(juninaCountdown(at(6, 23))).toEqual({ kind: 'days', days: 1 })
})

it('cheers São João on the 24th, never "0 days", and keeps the arraiá after', () => {
  expect(juninaCountdown(at(6, 24))).toEqual({ kind: 'sao-joao' })
  expect(juninaCountdown(at(6, 29))).toEqual({ kind: 'arraia' })
})
