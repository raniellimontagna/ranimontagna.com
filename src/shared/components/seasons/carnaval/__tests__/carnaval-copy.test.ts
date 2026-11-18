import { getCarnavalCopy } from '../carnaval-copy'

it('has every text in the three languages and 24 different bloco names in each', () => {
  const pt = getCarnavalCopy('pt')
  for (const locale of ['pt', 'en', 'es']) {
    const copy = getCarnavalCopy(locale)
    expect(Object.keys(copy).sort()).toEqual(Object.keys(pt).sort())
    expect(copy.names).toHaveLength(24)
    expect(new Set(copy.names).size).toBe(24)
    for (const value of Object.values(copy)) expect(value).toBeTruthy()
  }
})

it('falls back to Portuguese for an unknown locale', () => {
  expect(getCarnavalCopy('it')).toBe(getCarnavalCopy('pt'))
})
