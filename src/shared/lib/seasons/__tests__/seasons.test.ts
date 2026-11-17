import { parseSeason, seasonOffKey, seasonOn } from '../seasons'

const at = (month: number, day: number, hour = 12, minute = 0) =>
  new Date(2026, month - 1, day, hour, minute)

describe('seasonOn', () => {
  it.each([
    [at(11, 30, 23, 59), null],
    [at(12, 1, 0, 0), 'natal'],
    [at(12, 26, 23, 59), 'natal'],
    [at(12, 27, 0, 0), null],
    [at(7, 15), null],
  ])('%s → %s', (date, expected) => {
    expect(seasonOn(date)).toBe(expected)
  })
})

describe('parseSeason', () => {
  it('accepts a known season id', () => {
    expect(parseSeason('natal')).toBe('natal')
  })

  it('rejects off, unknown values and null', () => {
    expect(parseSeason('off')).toBeNull()
    expect(parseSeason('halloween')).toBeNull()
    expect(parseSeason(null)).toBeNull()
  })
})

describe('seasonOffKey', () => {
  it('scopes the turn-off choice to one season of one year', () => {
    expect(seasonOffKey('natal', 2026)).toBe('season-off:natal-2026')
  })
})
