import type { Repository } from '@/features/projects/lib/github'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { ProjectsList } from '../projects-list'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    section: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <section className={className} {...props}>
        {children}
      </section>
    ),
    div: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock child components
vi.mock('../language-filter', () => ({
  LanguageFilter: ({
    languages,
    onSelect,
  }: {
    languages: string[]
    selected: string | null
    onSelect: (lang: string | null) => void
  }) => (
    <div data-testid="language-filter">
      <button type="button" onClick={() => onSelect(null)}>
        All
      </button>
      {languages.map((lang: string) => (
        <button key={lang} type="button" onClick={() => onSelect(lang)}>
          {lang}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('../featured-project', () => ({
  FeaturedProject: ({ repo }: { repo: { id: number; name: string } }) => (
    <div data-testid={`featured-${repo.id}`}>{repo.name}</div>
  ),
}))

vi.mock('../project-card', () => ({
  ProjectCard: ({ repo }: { repo: { id: number; name: string } }) => (
    <div data-testid={`project-${repo.id}`}>{repo.name}</div>
  ),
}))

describe('ProjectsList', () => {
  const mockFeaturedRepos: Repository[] = [
    {
      id: 1,
      name: 'featured-ts',
      description: 'Featured TypeScript project',
      html_url: 'https://github.com/user/featured-ts',
      homepage: null,
      stargazers_count: 100,
      forks_count: 20,
      language: 'TypeScript',
      topics: [],
      updated_at: '2024-01-01',
      fork: false,
    },
  ]

  const mockRepos: Repository[] = [
    {
      id: 2,
      name: 'regular-js',
      description: 'Regular JavaScript project',
      html_url: 'https://github.com/user/regular-js',
      homepage: null,
      stargazers_count: 50,
      forks_count: 10,
      language: 'JavaScript',
      topics: [],
      updated_at: '2024-01-02',
      fork: false,
    },
    {
      id: 3,
      name: 'regular-ts',
      description: 'Regular TypeScript project',
      html_url: 'https://github.com/user/regular-ts',
      homepage: null,
      stargazers_count: 30,
      forks_count: 5,
      language: 'TypeScript',
      topics: [],
      updated_at: '2024-01-03',
      fork: false,
    },
  ]

  it('renders language filter with correct languages', () => {
    render(<ProjectsList featuredRepos={mockFeaturedRepos} repos={mockRepos} />)

    expect(screen.getByTestId('language-filter')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
  })

  it('renders featured section when featured projects exist', () => {
    render(<ProjectsList featuredRepos={mockFeaturedRepos} repos={mockRepos} />)

    expect(screen.getByText('featuredTitle')).toBeInTheDocument()
    expect(screen.getByTestId('featured-1')).toBeInTheDocument()
  })

  it('renders all projects section', () => {
    render(<ProjectsList featuredRepos={mockFeaturedRepos} repos={mockRepos} />)

    expect(screen.getByText('allProjectsTitle')).toBeInTheDocument()
    expect(screen.getByTestId('project-2')).toBeInTheDocument()
    expect(screen.getByTestId('project-3')).toBeInTheDocument()
  })

  it('filters projects by selected language', () => {
    render(<ProjectsList featuredRepos={mockFeaturedRepos} repos={mockRepos} />)

    // Click TypeScript filter
    const tsButton = screen.getByRole('button', { name: 'TypeScript' })
    fireEvent.click(tsButton)

    // Should show TypeScript projects only
    expect(screen.queryByTestId('project-2')).not.toBeInTheDocument() // JavaScript project
    expect(screen.getByTestId('project-3')).toBeInTheDocument() // TypeScript project
  })

  it('shows all projects when "All" filter is selected', () => {
    render(<ProjectsList featuredRepos={mockFeaturedRepos} repos={mockRepos} />)

    // Click TypeScript filter first
    const tsButton = screen.getByRole('button', { name: 'TypeScript' })
    fireEvent.click(tsButton)

    // Then click All
    const allButton = screen.getByRole('button', { name: 'All' })
    fireEvent.click(allButton)

    // Should show all projects
    expect(screen.getByTestId('project-2')).toBeInTheDocument()
    expect(screen.getByTestId('project-3')).toBeInTheDocument()
  })

  it('shows "No projects found" when filtered list is empty', () => {
    const emptyRepos: Repository[] = []
    render(<ProjectsList featuredRepos={emptyRepos} repos={emptyRepos} />)

    expect(screen.getByText('noProjectsFound')).toBeInTheDocument()
  })

  it('filters featured projects by language', () => {
    const multipleFeatured: Repository[] = [
      ...mockFeaturedRepos,
      {
        id: 4,
        name: 'featured-js',
        description: 'Featured JavaScript project',
        html_url: 'https://github.com/user/featured-js',
        homepage: null,
        stargazers_count: 80,
        forks_count: 15,
        language: 'JavaScript',
        topics: [],
        updated_at: '2024-01-04',
        fork: false,
      },
    ]

    render(<ProjectsList featuredRepos={multipleFeatured} repos={mockRepos} />)

    // Click JavaScript filter
    const jsButton = screen.getByRole('button', { name: 'JavaScript' })
    fireEvent.click(jsButton)

    // Should show JavaScript featured project only
    expect(screen.queryByTestId('featured-1')).not.toBeInTheDocument() // TypeScript
    expect(screen.getByTestId('featured-4')).toBeInTheDocument() // JavaScript
  })
})
