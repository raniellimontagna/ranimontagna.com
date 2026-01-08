import ProjectsPage from '@/app/[locale]/projects/page'
import { render, screen } from '@/tests/test-utils'

// Mocks
vi.mock('@/features/projects/lib/github', () => ({
  getFeaturedRepositories: vi.fn().mockResolvedValue([]),
  getRegularRepositories: vi.fn().mockResolvedValue([]),
  getGitHubStats: vi.fn().mockResolvedValue({
    public_repos: 50,
    followers: 10,
    total_stars: 100,
  }),
  getLanguagesFromRepos: vi.fn().mockReturnValue([]),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

describe('Projects Page', () => {
  it('renders projects page correctly', async () => {
    // Call the async server component directly
    const page = await ProjectsPage({
      params: Promise.resolve({ locale: 'pt' }),
    })

    render(page)

    // Check header content (translations are mocked to return key)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // Check main sections
    expect(screen.getByRole('navigation', { name: /Breadcrumb/i })).toBeInTheDocument()

    // Check projects list headers (mock returns key strings)
    expect(screen.getByText('filterByLanguage')).toBeInTheDocument()
    expect(screen.getByText('allProjectsTitle')).toBeInTheDocument()
  })
})
