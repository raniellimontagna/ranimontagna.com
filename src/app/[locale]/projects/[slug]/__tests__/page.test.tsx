import { notFound } from 'next/navigation'
import { render, screen } from '@/tests/test-utils'
import CasePage, { generateMetadata, generateStaticParams } from '../page'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue(
    Object.assign((key: string) => key, {
      raw: (key: string) => [0, 1, 2].map((i) => `${key}.${i}`),
    }),
  ),
  setRequestLocale: vi.fn(),
}))

describe('case page', () => {
  it('static params cover both cases in every locale', async () => {
    expect(await generateStaticParams()).toHaveLength(6)
  })

  it('unknown slug triggers notFound', async () => {
    await expect(
      CasePage({ params: Promise.resolve({ locale: 'pt', slug: 'xyz' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('renders every chapter heading and each tour step with both of its screens, server-side', async () => {
    render(await CasePage({ params: Promise.resolve({ locale: 'pt', slug: 'klick' }) }))
    expect(screen.getByRole('heading', { level: 1, name: 'klick.name' })).toBeInTheDocument()
    for (const chapter of ['pain', 'decisions', 'product', 'build']) {
      expect(
        screen.getByRole('heading', { level: 2, name: `klick.${chapter}.title` }),
      ).toBeInTheDocument()
    }
    const named = (text: string) => [
      ...screen.queryAllByAltText(text),
      ...screen.queryAllByLabelText(text),
    ]
    for (const step of ['evolucao', 'trilha', 'centro']) {
      expect(
        screen.getByRole('heading', { level: 3, name: `klick.tour.${step}.title` }),
      ).toBeInTheDocument()
      expect(named(`klick.tour.${step}.deskAlt`).length).toBeGreaterThan(0)
      expect(named(`klick.tour.${step}.phoneAlt`).length).toBeGreaterThan(0)
    }
    expect(named('klick.heroAlt').length).toBeGreaterThan(0)
    expect(named('klick.heroPhoneAlt').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /common\.next/ })).toHaveAttribute(
      'href',
      '/projects/grimory',
    )
  })

  it('quotes the agent-assisted commits from the data as one sentence', async () => {
    render(await CasePage({ params: Promise.resolve({ locale: 'pt', slug: 'klick' }) }))
    expect(screen.getByText('428 common.of 429 klick.build.statLabel')).toBeInTheDocument()
  })

  it('shares the case with its own 1200×630 card', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en', slug: 'grimory' }),
    })
    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://ranimontagna.com/redesign/cases/v1/grimory-og.jpg',
        width: 1200,
        height: 630,
      },
    ])
    expect(metadata.twitter?.images).toEqual([
      'https://ranimontagna.com/redesign/cases/v1/grimory-og.jpg',
    ])
  })

  it('links the live product and hides the repository link when it is private', async () => {
    render(await CasePage({ params: Promise.resolve({ locale: 'pt', slug: 'grimory' }) }))
    expect(screen.getByRole('link', { name: /common\.live/ })).toHaveAttribute(
      'href',
      'https://grimory.com.br',
    )
    expect(screen.queryByRole('link', { name: /common\.repo/ })).toBeNull()
  })
})
