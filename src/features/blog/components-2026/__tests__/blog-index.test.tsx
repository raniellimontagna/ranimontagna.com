import type { PostSummary } from '@/features/blog/lib/blog'
import { render, screen } from '@/tests/test-utils'
import { BlogIndex, groupByYear } from '../blog-index'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

const post = (slug: string, date: string): PostSummary => ({
  slug,
  metadata: {
    title: `Title ${slug}`,
    date,
    description: `About ${slug}`,
    tags: [],
    published: true,
  },
})

const posts = [post('c', '2026-07-11'), post('b', '2026-03-02'), post('a', '2025-12-20')]

describe('groupByYear', () => {
  it('groups posts by year, newest year first, keeping order inside each year', () => {
    expect(groupByYear(posts).map(([year, items]) => [year, items.map((p) => p.slug)])).toEqual([
      ['2026', ['c', 'b']],
      ['2025', ['a']],
    ])
  })
})

describe('BlogIndex', () => {
  it('features the latest post and lists the rest by year, each linking to its page', async () => {
    render(await BlogIndex({ posts, locale: 'pt' }))
    const featured = screen.getByRole('link', { name: /Title c/ })
    expect(featured).toHaveAttribute('href', '/blog/c')
    expect(screen.getByRole('link', { name: /Title b/ })).toHaveAttribute('href', '/blog/b')
    expect(screen.getByRole('link', { name: /Title a/ })).toHaveAttribute('href', '/blog/a')
    expect(screen.getByRole('heading', { level: 2, name: '2025' })).toBeInTheDocument()
  })

  it('shows an empty state when there are no posts', async () => {
    render(await BlogIndex({ posts: [], locale: 'pt' }))
    expect(screen.getByText('empty')).toBeInTheDocument()
  })
})
