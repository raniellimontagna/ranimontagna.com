import ProjectsPage from '@/app/[locale]/projects/page'
import { render, screen } from '@/tests/test-utils'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  setRequestLocale: vi.fn(),
}))

vi.mock('@/features/projects/lib/github.server', () => ({
  getGitHubProjectSnapshot: vi.fn().mockResolvedValue({
    featuredRepos: [],
    repos: [],
    languages: [],
    stats: { public_repos: 0, followers: 0, total_stars: 0 },
  }),
}))

describe('Projects Page', () => {
  it('renders the new projects index with the cases first', async () => {
    render(await ProjectsPage({ params: Promise.resolve({ locale: 'pt' }) }))
    expect(screen.getByRole('heading', { level: 1, name: 'title' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /klick\.name/ })).toHaveAttribute(
      'href',
      '/projects/klick',
    )
    expect(screen.getByRole('link', { name: /grimory\.name/ })).toHaveAttribute(
      'href',
      '/projects/grimory',
    )
  })
})
