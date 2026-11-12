import { existsSync } from 'node:fs'
import { join } from 'node:path'
import nextConfig from '../../../../../../next.config'
import { PORTRAIT_CACHE_SOURCE, PORTRAIT_IMAGE, PORTRAIT_WIDTHS } from '../portrait-image'

describe('PORTRAIT_IMAGE', () => {
  it('lists pre-sized copies from phone to retina laptop, each one present in public', () => {
    const entries = PORTRAIT_IMAGE.srcSet.split(', ').map((entry) => entry.split(' '))
    expect(entries.map(([, width]) => width)).toEqual(PORTRAIT_WIDTHS.map((w) => `${w}w`))
    expect(PORTRAIT_WIDTHS).toEqual([384, 640, 750, 828, 1080, 1440])
    for (const [url] of entries) {
      expect(url).toMatch(/^\/redesign\/portrait\/v\d+\//)
      expect(existsSync(join(process.cwd(), 'public', url))).toBe(true)
    }
    expect(PORTRAIT_IMAGE.srcSet).toContain(PORTRAIT_IMAGE.src)
  })

  it('is full width until lg, where the hero splits in two', () => {
    expect(PORTRAIT_IMAGE.sizes).toBe('(max-width: 1023px) 100vw, 50vw')
  })

  it('caches the copies for a year with a rule built from the same folder and widths', async () => {
    const rules = (await nextConfig.headers?.()) ?? []
    const index = rules.findIndex((item) => item.source === PORTRAIT_CACHE_SOURCE)
    expect(index).toBe(rules.length - 1)
    expect(rules[index].headers).toContainEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    })
    // Every listed file matches the rule; an unlisted width does not.
    const pattern = new RegExp(
      `^${PORTRAIT_CACHE_SOURCE.replace(/\./g, '\\.').replace(/:width\(([^)]+)\)/, '($1)')}$`,
    )
    for (const entry of PORTRAIT_IMAGE.srcSet.split(', ')) {
      expect(entry.split(' ')[0]).toMatch(pattern)
    }
    expect(PORTRAIT_IMAGE.src.replace('750', '999')).not.toMatch(pattern)
  })
})
