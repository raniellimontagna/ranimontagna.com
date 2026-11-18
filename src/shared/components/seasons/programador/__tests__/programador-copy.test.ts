import { getProgramadorCopy } from '../programador-copy'

it('falls back to Portuguese for an unknown locale', () => {
  expect(getProgramadorCopy('fr')).toBe(getProgramadorCopy('pt'))
})

it('reviews the same code in every language, one bug line per PR', () => {
  const [pt, en, es] = ['pt', 'en', 'es'].map(getProgramadorCopy)
  expect(pt.prs).toHaveLength(5)
  pt.prs.forEach((pr, i) => {
    expect(en.prs[i].lines).toEqual(pr.lines)
    expect(es.prs[i].lines).toEqual(pr.lines)
    expect(en.prs[i].bug).toBe(pr.bug)
    expect(es.prs[i].bug).toBe(pr.bug)
    expect(pr.lines[pr.bug]).toBeDefined()
  })
})

it('keeps every line short enough for a phone', () => {
  for (const pr of getProgramadorCopy('pt').prs) {
    for (const line of pr.lines) expect(line.length).toBeLessThanOrEqual(36)
  }
})
