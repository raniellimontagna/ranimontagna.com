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

// The stage is held at the height of a five-line PR before the layer loads (seasons.css).
it('keeps every PR within five lines short enough for a phone', () => {
  for (const pr of getProgramadorCopy('pt').prs) {
    expect(pr.lines.length).toBeLessThanOrEqual(5)
    for (const line of pr.lines) expect(line.length).toBeLessThanOrEqual(36)
  }
})
