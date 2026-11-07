import sitemap from '../sitemap'

vi.mock('@/features/blog/lib/blog', () => ({ getAllPosts: vi.fn().mockResolvedValue([]) }))

it('lists the Klick and Grimory case pages in every locale', async () => {
  const urls = (await sitemap()).map((entry) => entry.url)
  for (const slug of ['klick', 'grimory']) {
    expect(urls).toContain(`https://ranimontagna.com/projects/${slug}`)
    expect(urls).toContain(`https://ranimontagna.com/en/projects/${slug}`)
    expect(urls).toContain(`https://ranimontagna.com/es/projects/${slug}`)
  }
})
