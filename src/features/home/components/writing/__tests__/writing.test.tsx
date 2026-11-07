import { getAllPosts } from '@/features/blog/lib/blog'
import { render, screen } from '@/tests/test-utils'
import { Writing } from '../writing'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))
vi.mock('@/features/blog/lib/blog', () => ({ getAllPosts: vi.fn() }))

const post = (n: number) => ({
  slug: `post-${n}`,
  metadata: {
    title: `Post ${n}`,
    date: `2026-0${n}-01`,
    description: 'd',
    tags: [],
    published: true,
    coverImage: `cover-${n}.webp`,
  },
})

describe('Writing', () => {
  it('lists the four latest posts linking to their pages', async () => {
    vi.mocked(getAllPosts).mockResolvedValue([6, 5, 4, 3, 2, 1].map(post))
    render(await Writing({ locale: 'pt' }))
    const links = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('/blog/'))
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/blog/post-6',
      '/blog/post-5',
      '/blog/post-4',
      '/blog/post-3',
    ])
    expect(screen.getByRole('link', { name: 'all' })).toHaveAttribute('href', '/blog')
    expect(document.getElementById('escrita')).toBeInTheDocument()
  })

  it('renders nothing when the blog is unavailable', async () => {
    vi.mocked(getAllPosts).mockRejectedValue(new Error('rate limited'))
    const { container } = render((await Writing({ locale: 'pt' })) ?? <></>)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when there are no posts', async () => {
    vi.mocked(getAllPosts).mockResolvedValue([])
    const { container } = render((await Writing({ locale: 'pt' })) ?? <></>)
    expect(container).toBeEmptyDOMElement()
  })

  it('the cursor image is decorative', async () => {
    vi.mocked(getAllPosts).mockResolvedValue([3, 2, 1].map(post))
    render(await Writing({ locale: 'pt' }))
    expect(document.querySelector('[data-cursor-image]')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('link', { name: /Post 3/ })).toBeInTheDocument()
  })
})
