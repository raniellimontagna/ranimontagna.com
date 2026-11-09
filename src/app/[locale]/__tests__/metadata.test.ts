import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { generateMetadata as blogMetadata } from '../blog/page'
import { generateMetadata as layoutMetadata } from '../layout'
import { generateMetadata as projectsMetadata } from '../projects/page'

vi.mock('server-only', () => ({}))
vi.mock('next/navigation', () => ({ notFound: vi.fn() }))
vi.mock('next-intl', () => ({ hasLocale: vi.fn().mockReturnValue(true) }))
vi.mock('next-intl/server', () => ({
  getTranslations: vi
    .fn()
    .mockResolvedValue(Object.assign((key: string) => key, { has: () => true, raw: () => [] })),
  setRequestLocale: vi.fn(),
}))

type Image = { url: string; width: number; height: number }
type Meta = { openGraph?: { images?: unknown }; twitter?: { images?: unknown } }

const imagesOf = (metadata: Meta) => {
  const og = metadata.openGraph?.images
  return {
    og: (Array.isArray(og) ? og : [og]) as Image[],
    twitter: metadata.twitter?.images as string[] | undefined,
  }
}
const params = (locale: string) =>
  ({ params: Promise.resolve({ locale }) }) as Parameters<typeof layoutMetadata>[0]

describe('share image', () => {
  it.each(['pt', 'en', 'es'])(
    'uses a 1200x630 card in %s that exists in public/og',
    async (locale) => {
      const { og, twitter } = imagesOf((await layoutMetadata(params(locale))) as Meta)
      expect(og[0]).toMatchObject({ width: 1200, height: 630 })
      expect(og[0].url).toMatch(new RegExp(`/og/og-${locale}\\.jpg$`))
      expect(twitter?.[0]).toBe(og[0].url)
      expect(existsSync(join(process.cwd(), 'public', 'og', `og-${locale}.jpg`))).toBe(true)
    },
  )

  it.each([
    ['projects', projectsMetadata],
    ['blog', blogMetadata],
  ])(
    'keeps the card on /%s, whose own openGraph replaces the layout one',
    async (_name, generate) => {
      const { og, twitter } = imagesOf(
        (await generate({ params: Promise.resolve({ locale: 'en' }) })) as Meta,
      )
      expect(og[0]?.url).toMatch(/\/og\/og-en\.jpg$/)
      expect(twitter?.[0]).toBe(og[0].url)
    },
  )

  it('falls back to the default language card for an unknown locale', async () => {
    const { og } = imagesOf((await layoutMetadata(params('foo.bar'))) as Meta)
    expect(og[0].url).toMatch(/\/og\/og-pt\.jpg$/)
  })
})
