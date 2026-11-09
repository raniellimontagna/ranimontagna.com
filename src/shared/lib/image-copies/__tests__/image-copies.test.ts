import { existsSync } from 'node:fs'
import { join } from 'node:path'
import nextConfig from '../../../../../next.config'
import { COPIES_CACHE_SOURCE, copiesOf, IMAGE_COPY_MASTERS } from '../image-copies'

const exists = (url: string) => existsSync(join(process.cwd(), 'public', url))
const entries = (srcSet: string) => srcSet.split(', ').map((entry) => entry.split(' '))

describe('image copies', () => {
  it('lists masters that ship in public/', () => {
    expect(IMAGE_COPY_MASTERS.length).toBeGreaterThanOrEqual(15)
    for (const master of IMAGE_COPY_MASTERS) expect(exists(master), master).toBe(true)
  })

  it('names AVIF and WebP copies after the master, never wider than it', () => {
    const scene = copiesOf('/redesign/scenes/pain-codex.webp')
    expect(entries(scene.avif).map(([, w]) => w)).toEqual(['640w', '1080w', '1536w'])
    expect(entries(scene.webp)[0]?.[0]).toBe(
      '/redesign/copies/v1/redesign-scenes-pain-codex-640.webp',
    )
    const compendium = copiesOf('/redesign/products/grimory-compendium.webp')
    expect(entries(compendium.webp).map(([, w]) => w)).toEqual(['640w', '1080w', '1600w'])
    expect(compendium.width).toBe(1600)
    expect(compendium.height).toBe(1125)
  })

  it('ships every copy it names', () => {
    for (const master of IMAGE_COPY_MASTERS) {
      const { avif, webp, src } = copiesOf(master)
      for (const [url] of [...entries(avif), ...entries(webp), [src]])
        expect(exists(url ?? ''), url).toBe(true)
    }
  })

  it('refuses a master that is not listed, so a new image cannot skip its copies', () => {
    expect(() => copiesOf('/images/nope.webp')).toThrow(/not listed/)
  })

  it('caches the copies for a year, with a rule that matches only them', async () => {
    const rules = (await nextConfig.headers?.()) ?? []
    const rule = rules.find((item) => item.source === COPIES_CACHE_SOURCE)
    expect(rule?.headers).toContainEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    })
    const dayRule = rules.findIndex((item) => item.source.includes('webp|woff'))
    expect(rules.indexOf(rule as (typeof rules)[number])).toBeGreaterThan(dayRule)
    const pattern = new RegExp(
      `^${COPIES_CACHE_SOURCE.replace(/\./g, '\\.').replace(/:(\w+)\(([^)]+)\)/g, '($2)')}$`,
    )
    for (const master of IMAGE_COPY_MASTERS) {
      const { avif, webp } = copiesOf(master)
      for (const [url] of [...entries(avif), ...entries(webp)]) expect(url).toMatch(pattern)
    }
    expect('/redesign/copies/v1/redesign-scenes-pain-codex-999.webp').not.toMatch(pattern)
    expect('/redesign/scenes/pain-codex.webp').not.toMatch(pattern)
  })
})
