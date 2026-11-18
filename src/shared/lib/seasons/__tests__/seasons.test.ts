import {
  easterSunday,
  parseSeason,
  SEASONS,
  type SeasonRule,
  seasonEdition,
  seasonOffKey,
  seasonOn,
  seasonWindowOn,
  seasonWindows,
} from '../seasons'

const at = (month: number, day: number, hour = 12, minute = 0, year = 2026) =>
  new Date(year, month - 1, day, hour, minute)

describe('seasonOn', () => {
  it.each([
    [at(11, 24, 23, 59), null],
    [at(11, 25, 0, 0), 'natal'],
    [at(11, 30, 23, 59), 'natal'],
    [at(12, 26, 23, 59), 'natal'],
    [at(12, 27, 0, 0), 'reveillon'],
    [at(12, 31, 23, 59), 'reveillon'],
    [at(1, 6, 23, 59, 2027), 'reveillon'],
    [at(1, 7, 0, 0, 2027), null],
    [at(7, 15), null],
    [at(1, 29, 23, 59, 2027), null],
    [at(1, 30, 0, 0, 2027), 'carnaval'],
    [at(2, 9, 12, 0, 2027), 'carnaval'],
    [at(2, 10, 23, 59, 2027), 'carnaval'],
    [at(2, 11, 0, 0, 2027), null],
    [at(2, 14, 12, 0, 2026), 'carnaval'],
    [at(3, 20, 23, 59, 2027), null],
    [at(3, 21, 0, 0, 2027), 'pascoa'],
    [at(3, 29, 23, 59, 2027), 'pascoa'],
    [at(3, 30, 0, 0, 2027), null],
    [at(4, 5, 12, 0, 2026), 'pascoa'],
    [at(5, 31, 23, 59, 2027), null],
    [at(6, 1, 0, 0, 2027), 'junina'],
    [at(6, 24, 12, 0, 2027), 'junina'],
    [at(6, 30, 23, 59, 2027), 'junina'],
    [at(7, 1, 0, 0, 2027), null],
  ])('%s → %s', (date, expected) => {
    expect(seasonOn(date)).toBe(expected)
  })
})

describe('easterSunday', () => {
  it.each([
    [2024, 2, 31],
    [2025, 3, 20],
    [2026, 3, 5],
    [2027, 2, 28],
    [2038, 3, 25],
    [2285, 2, 22],
  ])('Easter %i is month %i day %i', (year, month, day) => {
    expect(easterSunday(year)).toEqual(new Date(year, month, day))
  })
})

describe('seasonWindows', () => {
  it('ends a window that wraps the year in the next one, under the year it starts', () => {
    const reveillon = seasonWindows(2026).find((window) => window.id === 'reveillon')
    expect(reveillon).toEqual({ id: 'reveillon', edition: 2026, from: 20261227, to: 20270106 })
  })

  it('places Easter-based edges by the Easter of that year', () => {
    const rules: SeasonRule[] = [
      { id: 'natal', from: { easter: -57 }, to: { easter: -46 } },
      { id: 'reveillon', from: { easter: -7 }, to: { easter: 1 } },
    ]
    expect(seasonWindows(2027, rules)).toEqual([
      { id: 'natal', edition: 2027, from: 20270130, to: 20270210 },
      { id: 'reveillon', edition: 2027, from: 20270321, to: 20270329 },
    ])
  })

  it('never overlaps two seasons, 2026 to 2040', () => {
    for (
      let day = new Date(2026, 0, 1);
      day.getFullYear() <= 2040;
      day.setDate(day.getDate() + 1)
    ) {
      const key = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate()
      const year = day.getFullYear()
      const hits = [...seasonWindows(year - 1), ...seasonWindows(year)].filter(
        (window) => key >= window.from && key <= window.to,
      )
      expect(hits.length, String(key)).toBeLessThanOrEqual(1)
    }
  })
})

describe('seasonWindowOn', () => {
  it('names the edition: New Year days belong to the year the season started', () => {
    expect(seasonWindowOn(at(1, 3, 12, 0, 2027))).toEqual({ id: 'reveillon', edition: 2026 })
    expect(seasonWindowOn(at(12, 27))).toEqual({ id: 'reveillon', edition: 2026 })
    expect(seasonWindowOn(at(12, 10))).toEqual({ id: 'natal', edition: 2026 })
    expect(seasonWindowOn(at(1, 7, 12, 0, 2027))).toBeNull()
  })
})

describe('seasonEdition', () => {
  it('is the edition in course, or else the next one', () => {
    expect(seasonEdition('reveillon', at(11, 18))).toBe(2026)
    expect(seasonEdition('reveillon', at(1, 2, 12, 0, 2027))).toBe(2026)
    expect(seasonEdition('reveillon', at(3, 1, 12, 0, 2027))).toBe(2027)
    expect(seasonEdition('natal', at(12, 31))).toBe(2027)
  })
})

describe('parseSeason', () => {
  it('accepts every known season id', () => {
    for (const { id } of SEASONS) expect(parseSeason(id)).toBe(id)
  })

  it('rejects off, unknown values and null', () => {
    expect(parseSeason('off')).toBeNull()
    expect(parseSeason('xmas')).toBeNull()
    expect(parseSeason(null)).toBeNull()
  })
})

describe('seasonOffKey', () => {
  it('scopes the turn-off choice to one edition of one season', () => {
    expect(seasonOffKey('natal', 2026)).toBe('season-off:natal-2026')
    expect(seasonOffKey('reveillon', 2026)).toBe('season-off:reveillon-2026')
  })
})
