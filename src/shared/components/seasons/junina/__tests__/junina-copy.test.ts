import { getJuninaCopy } from '../junina-copy'

it('has every text in the three languages, with the same five prizes', () => {
  const pt = getJuninaCopy('pt')
  for (const locale of ['en', 'es']) {
    const copy = getJuninaCopy(locale)
    expect(Object.keys(copy).sort()).toEqual(Object.keys(pt).sort())
    expect(copy.prizes.map((p) => p.name)).toEqual(pt.prizes.map((p) => p.name))
    for (const value of Object.values(copy)) expect(value).toBeTruthy()
  }
  expect(getJuninaCopy('fr')).toBe(pt)
})
