import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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

// The prizes repeat the live-work section in short: they must name what is there.
it('names only projects the live-work section shows, in every language', () => {
  for (const locale of ['pt', 'en', 'es']) {
    const messages = JSON.parse(
      readFileSync(join(process.cwd(), `messages/${locale}.json`), 'utf8'),
    ) as { liveWork: { items: Record<string, { name: string }> } }
    const live = Object.values(messages.liveWork.items).map((item) => item.name)
    for (const prize of getJuninaCopy(locale).prizes) expect(live).toContain(prize.name)
  }
})
