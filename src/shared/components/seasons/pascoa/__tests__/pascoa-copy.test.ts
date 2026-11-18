import { getPascoaCopy } from '../pascoa-copy'

it('has every text in the three languages', () => {
  const pt = getPascoaCopy('pt')
  for (const locale of ['en', 'es']) {
    const copy = getPascoaCopy(locale)
    expect(Object.keys(copy).sort()).toEqual(Object.keys(pt).sort())
    for (const value of Object.values(copy)) expect(value).toBeTruthy()
  }
  expect(getPascoaCopy('de')).toBe(pt)
})
