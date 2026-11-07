import { getAllPosts } from '@/features/blog/lib/blog'
import { SITE_NAV } from '@/shared/shell/site-nav'
import { render, screen } from '@/tests/test-utils'
import ptMessages from '../../../../messages/pt.json'
import { HomeBody } from '../components/home-body'
import { Home } from '../home'

vi.mock('next-intl/server', () => ({
  getTranslations: vi
    .fn()
    .mockResolvedValue(Object.assign((key: string) => key, { raw: (key: string) => [`${key}.0`] })),
  getMessages: vi.fn().mockResolvedValue(ptMessages),
  getLocale: vi.fn().mockResolvedValue('pt'),
}))
vi.mock('@/features/blog/lib/blog', () => ({ getAllPosts: vi.fn() }))

describe('Home', () => {
  beforeEach(() => {
    vi.mocked(getAllPosts).mockResolvedValue([
      {
        slug: 'a',
        metadata: { title: 'A', date: '2026-01-01', description: '', tags: [], published: true },
      },
    ])
  })

  it('renders the new sections in order inside main', async () => {
    render(
      <Home
        heroContent={<div data-testid="hero" />}
        bodyContent={await HomeBody({ locale: 'pt' })}
      />,
    )
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
    const ids = [...main.querySelectorAll('section[id]')].map((section) => section.id)
    expect(ids).toEqual(['como-trabalho', 'no-ar', 'trajetoria', 'atto', 'escrita', 'contato'])
  })

  it('every home link in the site nav points to a section that exists', async () => {
    render(<Home heroContent={<div />} bodyContent={await HomeBody({ locale: 'pt' })} />)
    for (const item of SITE_NAV.filter((entry) => entry.href.startsWith('/#'))) {
      expect(document.getElementById(item.href.slice(2))).toBeInTheDocument()
    }
  })

  it('no longer renders the old sections', async () => {
    render(<Home heroContent={<div />} bodyContent={await HomeBody({ locale: 'pt' })} />)
    for (const id of ['about', 'experience', 'projects', 'services', 'contact']) {
      expect(document.getElementById(id)).toBeNull()
    }
  })
})
