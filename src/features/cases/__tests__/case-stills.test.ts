import { existsSync } from 'node:fs'
import { join } from 'node:path'
import nextConfig from '../../../../next.config'
import { DESK_WIDTHS, PHONE_WIDTHS, STILLS_CACHE_SOURCE, stillSources } from '../case-stills'
import { CASES } from '../cases.data'

const exists = (url: string) => existsSync(join(process.cwd(), 'public', url))
const urls = (srcSet: string) => srcSet.split(', ').map((entry) => entry.split(' ')[0] ?? '')
const widths = (srcSet: string) => srcSet.split(', ').map((entry) => entry.split(' ')[1])

const everyStill = () =>
  Object.values(CASES).flatMap((study) =>
    [study.hero, ...study.tour.map((step) => step.screens)].flatMap((screens) => [
      { master: screens.desk.src, kind: 'desk' as const },
      { master: screens.phone.src, kind: 'phone' as const },
    ]),
  )

describe('case stills', () => {
  it('names pre-sized AVIF and WebP copies of a master, desk and phone widths apart', () => {
    const desk = stillSources('/redesign/cases/v1/klick-desk-evolucao.webp', 'desk')
    expect(widths(desk.avif)).toEqual(DESK_WIDTHS.map((w) => `${w}w`))
    expect(urls(desk.avif)[0]).toBe('/redesign/cases/v1/sized/klick-desk-evolucao-640.avif')
    expect(urls(desk.webp).at(-1)).toBe('/redesign/cases/v1/sized/klick-desk-evolucao-2400.webp')
    expect(desk.src).toBe('/redesign/cases/v1/sized/klick-desk-evolucao-1600.webp')

    const phone = stillSources('/redesign/cases/v1/grimory-phone-ficha.webp', 'phone')
    expect(widths(phone.webp)).toEqual(PHONE_WIDTHS.map((w) => `${w}w`))
    expect(phone.src).toBe('/redesign/cases/v1/sized/grimory-phone-ficha-480.webp')
  })

  it('ships every copy of every screen the case pages use', () => {
    for (const { master, kind } of everyStill()) {
      const { avif, webp, src } = stillSources(master, kind)
      for (const url of [...urls(avif), ...urls(webp), src]) expect(exists(url), url).toBe(true)
    }
  })

  it('caches the copies for a year with a rule built from the same folder and widths', async () => {
    const rules = (await nextConfig.headers?.()) ?? []
    const rule = rules.find((item) => item.source === STILLS_CACHE_SOURCE)
    expect(rule?.headers).toContainEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    })
    // After the one-day rule for public/ files, so it wins for these.
    const dayRule = rules.findIndex((item) => item.source.includes('webp|woff'))
    expect(rules.indexOf(rule as (typeof rules)[number])).toBeGreaterThan(dayRule)

    const pattern = new RegExp(
      `^${STILLS_CACHE_SOURCE.replace(/\./g, '\\.').replace(/:(\w+)\(([^)]+)\)/g, '($2)')}$`,
    )
    for (const { master, kind } of everyStill()) {
      const { avif, webp } = stillSources(master, kind)
      for (const url of [...urls(avif), ...urls(webp)]) expect(url).toMatch(pattern)
    }
    // An unlisted width or the master itself never picks up the year.
    expect('/redesign/cases/v1/sized/klick-desk-evolucao-999.webp').not.toMatch(pattern)
    expect('/redesign/cases/v1/klick-desk-evolucao.webp').not.toMatch(pattern)
  })
})
