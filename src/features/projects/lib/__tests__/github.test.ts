import type { Repository } from '../../types/github.types'
import { createGitHubProjectSnapshotLoader } from '../github-snapshot'

const mockListRepositories = vi.fn()
const mockGetUser = vi.fn()

const mockRepos: Repository[] = [
  {
    id: 1,
    name: 'repo-1',
    description: 'desc 1',
    html_url: 'url1',
    homepage: 'home1',
    language: 'TypeScript',
    stargazers_count: 100,
    forks_count: 10,
    updated_at: '2026-08-01T00:00:00Z',
    topics: ['react'],
    fork: false,
  },
  {
    id: 2,
    name: 'repo-2',
    description: 'desc 2',
    html_url: 'url2',
    homepage: null,
    language: 'JavaScript',
    stargazers_count: 50,
    forks_count: 5,
    updated_at: '2026-08-01T00:00:00Z',
    topics: [],
    fork: false,
  },
  {
    id: 3,
    name: 'repo-3-fork',
    description: 'fork desc',
    html_url: 'url3',
    homepage: null,
    language: 'Go',
    stargazers_count: 200,
    forks_count: 0,
    updated_at: '2026-08-01T00:00:00Z',
    topics: [],
    fork: true,
  },
  {
    id: 4,
    name: 'repo-4-old',
    description: 'old desc',
    html_url: 'url4',
    homepage: null,
    language: 'Rust',
    stargazers_count: 150,
    forks_count: 0,
    updated_at: '2020-01-01T00:00:00Z',
    topics: [],
    fork: false,
  },
  {
    id: 5,
    name: 'repo-5',
    description: 'desc 5',
    html_url: 'url5',
    homepage: null,
    language: 'Python',
    stargazers_count: 80,
    forks_count: 2,
    updated_at: '2026-08-01T00:00:00Z',
    topics: [],
    fork: false,
  },
  {
    id: 6,
    name: 'repo-6',
    description: 'desc 6',
    html_url: 'url6',
    homepage: null,
    language: 'Java',
    stargazers_count: 90,
    forks_count: 1,
    updated_at: '2026-08-01T00:00:00Z',
    topics: [],
    fork: false,
  },
]

describe('GitHub project snapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListRepositories.mockResolvedValue({ data: mockRepos })
    mockGetUser.mockResolvedValue({ data: { public_repos: 10, followers: 20 } })
  })

  const loadSnapshot = () =>
    createGitHubProjectSnapshotLoader({
      listRepositories: mockListRepositories,
      getUser: mockGetUser,
      now: () => new Date('2026-08-23T00:00:00Z'),
    })()

  it('filters forks and stale repositories, then derives every project view', async () => {
    const snapshot = await loadSnapshot()

    expect(snapshot.featuredRepos.map((repository) => repository.name)).toEqual([
      'repo-1',
      'repo-6',
      'repo-5',
    ])
    expect(snapshot.repos.map((repository) => repository.name)).toEqual(['repo-2'])
    expect(snapshot.languages).toEqual(['Java', 'JavaScript', 'Python', 'TypeScript'])
  })

  it('uses one cold repository request for projects, languages and stars', async () => {
    const snapshot = await loadSnapshot()

    expect(snapshot.stats).toEqual({ public_repos: 10, followers: 20, total_stars: 320 })
    expect(mockListRepositories).toHaveBeenCalledTimes(1)
    expect(mockGetUser).toHaveBeenCalledTimes(1)
  })
})
