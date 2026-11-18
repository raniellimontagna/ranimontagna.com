import { getHalloweenCopy } from '../halloween-copy'

it('has every text in the three languages', () => {
  const pt = getHalloweenCopy('pt')
  for (const locale of ['en', 'es']) {
    const copy = getHalloweenCopy(locale)
    expect(Object.keys(copy).sort()).toEqual(Object.keys(pt).sort())
    expect(copy.report).toHaveLength(3)
    for (const value of Object.values(copy)) expect(value).toBeTruthy()
  }
  expect(getHalloweenCopy('ja')).toBe(pt)
})
