import ProjectsPage from '@/app/[locale]/projects/page'
import { getGitHubProjectSnapshot } from '@/features/projects/lib/github.server'
import { render, screen } from '@/tests/test-utils'

// Mocks
vi.mock('@/features/projects/lib/github.server', () => ({
  getGitHubProjectSnapshot: vi.fn().mockResolvedValue({
    featuredRepos: [],
    repos: [],
    languages: [],
    stats: {
      public_repos: 50,
      followers: 10,
      total_stars: 100,
    },
  }),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  setRequestLocale: vi.fn(),
}))

describe('Projects Page', () => {
  it('renders projects page correctly', async () => {
    // Call the async server component directly
    const page = await ProjectsPage({
      params: Promise.resolve({ locale: 'pt' }),
    })

    const { container } = render(page)

    expect(container.firstElementChild).toHaveAttribute('data-spectral-zone', 'balanced')
    expect(container.firstElementChild).toHaveClass('bg-background/80')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
    expect(container.querySelector(`.${['atmospheric', 'grid'].join('-')}`)).not.toBeInTheDocument()

    // Check header content (translations are mocked to return key)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // Check main sections
    expect(screen.getByRole('navigation', { name: /Breadcrumb/i })).toBeInTheDocument()

    // Check projects list headers (mock returns key strings)
    expect(screen.getByText('filterByLanguage')).toBeInTheDocument()
    expect(screen.getByText('allProjectsTitle')).toBeInTheDocument()
    expect(getGitHubProjectSnapshot).toHaveBeenCalledTimes(1)
  })

  it('keeps above-the-fold project copy outside initially hidden animation wrappers', async () => {
    const page = await ProjectsPage({ params: Promise.resolve({ locale: 'en' }) })
    render(page)

    for (const copy of ['subtitle', 'content.paragraph1']) {
      const element = screen.getByText(copy)
      expect(element.closest('[data-gsap-reveal="true"]')).toBeNull()
      expect(element.closest('[data-gsap-text="true"]')).toBeNull()
      expect(element.closest('[style*="opacity: 0"]')).toBeNull()
    }
  })
})
