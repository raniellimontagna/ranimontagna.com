import type { ReactElement } from 'react'
import { getAllPosts } from '@/features/blog/lib/blog'
import { BELOW_LG_QUERY, loadScrollMotion, REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen, waitFor } from '@/tests/test-utils'
import { Writing } from '../writing'
import { buildWritingFocus } from '../writing-focus'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))
vi.mock('@/features/blog/lib/blog', () => ({ getAllPosts: vi.fn() }))
vi.mock('../writing-focus', () => ({ buildWritingFocus: vi.fn(() => () => {}) }))
vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  loadScrollMotion: vi.fn(() =>
    Promise.resolve({
      gsap: {
        context: (fn: () => void) => {
          fn()
          return { revert: vi.fn() }
        },
        matchMedia: () => ({
          add: (conditions: Record<string, string>, callback: () => void) => {
            if (Object.values(conditions).some((query) => window.matchMedia(query).matches))
              callback()
          },
          revert: vi.fn(),
        }),
      },
      ScrollTrigger: { batch: vi.fn() },
    }),
  ),
}))

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
    render((await Writing({ locale: 'pt' })) as React.ReactElement)
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
    render((await Writing({ locale: 'pt' })) as React.ReactElement)
    expect(document.querySelector('[data-cursor-image]')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('link', { name: /Post 3/ })).toBeInTheDocument()
  })

  it('marks each title and phone cover for the focus effect', async () => {
    vi.mocked(getAllPosts).mockResolvedValue([2, 1].map(post))
    render((await Writing({ locale: 'pt' })) as ReactElement)
    expect(document.querySelectorAll('[data-post-title]')).toHaveLength(2)
    expect(document.querySelectorAll('img[data-post-thumb]')).toHaveLength(2)
  })

  it('below lg builds the focus; from lg it does not', async () => {
    vi.mocked(getAllPosts).mockResolvedValue([2, 1].map(post))
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: true })
    const { unmount } = render((await Writing({ locale: 'pt' })) as ReactElement)
    await waitFor(() =>
      expect(buildWritingFocus).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(HTMLUListElement),
      ),
    )
    unmount()
    vi.mocked(buildWritingFocus).mockClear()
    vi.mocked(loadScrollMotion).mockClear()
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: false })
    render((await Writing({ locale: 'pt' })) as ReactElement)
    await waitFor(() => expect(loadScrollMotion).toHaveBeenCalled())
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(buildWritingFocus).not.toHaveBeenCalled()
  })
})
