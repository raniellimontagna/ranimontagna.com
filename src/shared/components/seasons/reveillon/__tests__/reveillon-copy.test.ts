import { getReveillonCopy } from '../reveillon-copy'

it('has every text in the three languages, with seven wishes each', () => {
  const pt = getReveillonCopy('pt')
  for (const locale of ['en', 'es']) {
    const copy = getReveillonCopy(locale)
    expect(Object.keys(copy).sort()).toEqual(Object.keys(pt).sort())
    expect(copy.wishes).toHaveLength(7)
    for (const value of Object.values(copy)) expect(value).toBeTruthy()
  }
})

it('falls back to Portuguese for an unknown locale', () => {
  expect(getReveillonCopy('fr')).toBe(getReveillonCopy('pt'))
})
