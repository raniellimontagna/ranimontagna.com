import type { GitHubProjectSnapshot, Repository } from '@/features/projects/types/github.types'
import { fireEvent, render, screen, within } from '@/tests/test-utils'
import { ProjectsIndex } from '../projects-index'
import { RepoList } from '../repo-list'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

const repo = (id: number, name: string, language: string | null): Repository => ({
  id,
  name,
  description: `${name} description`,
  html_url: `https://github.com/raniellimontagna/${name}`,
  homepage: null,
  language,
  stargazers_count: id,
  forks_count: 0,
  updated_at: '2026-11-01T00:00:00Z',
  topics: [],
  fork: false,
})

const repos = [
  repo(1, 'klick', 'Svelte'),
  repo(2, 'agent-toolkit', 'TypeScript'),
  repo(3, 'site', 'TypeScript'),
]
const snapshot: GitHubProjectSnapshot = {
  featuredRepos: [],
  repos,
  languages: ['Svelte', 'TypeScript'],
  stats: { public_repos: 30, followers: 12, total_stars: 40 },
}
const labels = {
  all: 'all',
  empty: 'empty',
  stars: 'stars',
  updated: 'updated',
  site: 'site',
  filterLabel: 'filter',
}

describe('ProjectsIndex', () => {
  it('shows the cases before the GitHub repositories', async () => {
    render(await ProjectsIndex({ snapshot, locale: 'pt' }))
    const caseLink = screen.getByRole('link', { name: /klick\.name/ })
    expect(caseLink).toHaveAttribute('href', '/projects/klick')
    const repoLink = screen.getByRole('link', { name: 'agent-toolkit' })
    expect(
      caseLink.compareDocumentPosition(repoLink) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('shows an empty state when GitHub returns nothing', async () => {
    render(
      await ProjectsIndex({
        snapshot: {
          ...snapshot,
          repos: [],
          languages: [],
          stats: { public_repos: 0, followers: 0, total_stars: 0 },
        },
        locale: 'pt',
      }),
    )
    expect(screen.getByText('repos.empty')).toBeInTheDocument()
  })
})

describe('RepoList', () => {
  it('filters by language and comes back with all', () => {
    render(
      <RepoList repos={repos} languages={['Svelte', 'TypeScript']} labels={labels} locale="pt" />,
    )
    const list = screen.getByRole('list', { name: 'filter' })
    fireEvent.click(screen.getByRole('button', { name: 'Svelte' }))
    expect(within(list).getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Svelte' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'all' }))
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  })

  it('gives the repository and site links 44 px tap targets', () => {
    const withSite = [{ ...repo(9, 'grimory', 'TypeScript'), homepage: 'https://grimory.com.br' }]
    render(<RepoList repos={withSite} languages={['TypeScript']} labels={labels} locale="pt" />)
    expect(screen.getByRole('link', { name: 'grimory' }).className).toContain('min-h-11')
    expect(screen.getByRole('link', { name: /grimory\.com\.br/ }).className).toContain('min-h-11')
  })

  it('gives the language filters 44 px tap targets on phones', () => {
    render(
      <RepoList repos={repos} languages={['Svelte', 'TypeScript']} labels={labels} locale="pt" />,
    )
    for (const name of ['all', 'Svelte']) {
      expect(screen.getByRole('button', { name }).className).toContain('min-h-11')
    }
  })
})
