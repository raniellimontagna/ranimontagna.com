import { notFound } from 'next/navigation'
import { render, screen } from '@/tests/test-utils'
import CasePage, { generateStaticParams } from '../page'

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

  it('renders every chapter heading and the gallery alts server-side', async () => {
    render(await CasePage({ params: Promise.resolve({ locale: 'pt', slug: 'klick' }) }))
    expect(screen.getByRole('heading', { level: 1, name: 'klick.name' })).toBeInTheDocument()
    for (const chapter of ['pain', 'decisions', 'product', 'build']) {
      expect(
        screen.getByRole('heading', { level: 2, name: `klick.${chapter}.title` }),
      ).toBeInTheDocument()
    }
    expect(screen.getAllByAltText(/klick\.gallery\./).length).toBeGreaterThanOrEqual(3)
    expect(screen.getByRole('link', { name: /common\.next/ })).toHaveAttribute(
      'href',
      '/projects/grimory',
    )
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
