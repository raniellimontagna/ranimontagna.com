import { existsSync } from 'node:fs'
import { join } from 'node:path'
import nextConfig from '../../../../../../next.config'
import { PORTRAIT_IMAGE } from '../portrait-image'

describe('PORTRAIT_IMAGE', () => {
  it('lists pre-sized copies from phone to retina laptop, each one present in public', () => {
    const entries = PORTRAIT_IMAGE.srcSet.split(', ').map((entry) => entry.split(' '))
    expect(entries.map(([, width]) => width)).toEqual([
      '384w',
      '640w',
      '750w',
      '828w',
      '1080w',
      '1440w',
    ])
    for (const [url] of entries) {
      expect(existsSync(join(process.cwd(), 'public', url))).toBe(true)
    }
    expect(PORTRAIT_IMAGE.srcSet).toContain(PORTRAIT_IMAGE.src)
  })

  it('caches the copies for a year: a new photo gets new file names', async () => {
    const rules = (await nextConfig.headers?.()) ?? []
    const index = rules.findIndex((item) => item.source.startsWith('/redesign/portrait/'))
    const rule = rules[index]
    // Only the listed widths, so a missing file's 404 never gets a year of cache.
    expect(rule?.source).toBe('/redesign/portrait/photo-:width(384|640|750|828|1080|1440).webp')
    // After the day-long rule for public files, so it wins.
    expect(index).toBe(rules.length - 1)
    expect(rule?.headers).toContainEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    })
  })
})
