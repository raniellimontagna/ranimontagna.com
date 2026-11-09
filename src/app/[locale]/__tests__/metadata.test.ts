import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { generateMetadata } from '../layout'

vi.mock('next/navigation', () => ({ notFound: vi.fn() }))
vi.mock('next-intl', () => ({ hasLocale: vi.fn().mockReturnValue(true) }))

const imagesFor = async (locale: string) => {
  const metadata = await generateMetadata({ params: Promise.resolve({ locale }) })
  const og = metadata.openGraph?.images
  const list = (Array.isArray(og) ? og : [og]) as Array<{
    url: string
    width: number
    height: number
  }>
  return { og: list, twitter: metadata.twitter?.images as string[] }
}

describe('share image', () => {
  it.each(['pt', 'en', 'es'])(
    'uses a 1200x630 card in %s that exists in public/og',
    async (locale) => {
      const { og, twitter } = await imagesFor(locale)
      expect(og[0]).toMatchObject({ width: 1200, height: 630 })
      expect(og[0].url).toMatch(new RegExp(`/og/og-${locale}\\.jpg$`))
      expect(twitter[0]).toBe(og[0].url)
      expect(existsSync(join(process.cwd(), 'public', 'og', `og-${locale}.jpg`))).toBe(true)
    },
  )
})
