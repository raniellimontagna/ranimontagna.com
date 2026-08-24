import type { Repository } from '../../types/github.types'
import { getGitHubProjectSnapshot } from '../github.server'

const { mockListForUser, mockGetByUsername } = vi.hoisted(() => ({
  mockListForUser: vi.fn(),
  mockGetByUsername: vi.fn(),
}))

const { mockOctokit } = vi.hoisted(() => ({
  mockOctokit: vi.fn(),
}))

vi.mock('@octokit/rest', () => {
  // We attach mocks to the prototype to simulate the instance methods
  mockOctokit.prototype.repos = {
    listForUser: mockListForUser,
  }
  mockOctokit.prototype.users = {
    getByUsername: mockGetByUsername,
  }
  return { Octokit: mockOctokit }
})

vi.mock('next/cache', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mocking cache wrapper
  unstable_cache: (fn: any) => fn,
}))

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
    updated_at: new Date().toISOString(), // recent
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
    updated_at: new Date().toISOString(), // recent
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
    stargazers_count: 200, // high stars but fork
    forks_count: 0,
    updated_at: new Date().toISOString(),
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
    updated_at: '2020-01-01T00:00:00Z', // old
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
    updated_at: new Date().toISOString(),
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
    updated_at: new Date().toISOString(),
    topics: [],
    fork: false,
  },
]

describe('GitHub project snapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('repository filtering', () => {
    beforeEach(() => {
      // Mock internal call inside unstable_cache
      mockListForUser.mockResolvedValue({
        data: mockRepos,
      })
    })

    it('filters forks and old repos, and sorts by stars', async () => {
      mockGetByUsername.mockResolvedValue({ data: { public_repos: 10, followers: 20 } })

      const snapshot = await getGitHubProjectSnapshot()

      // Top 3 should be repo-1, repo-6, repo-5
      expect(snapshot.featuredRepos.map((repo) => repo.name)).toEqual([
        'repo-1',
        'repo-6',
        'repo-5',
      ])
      expect(snapshot.repos.map((repo) => repo.name)).toEqual(['repo-2'])
      expect(snapshot.languages).toEqual(['Java', 'JavaScript', 'Python', 'TypeScript'])
    })
  })

  describe('snapshot statistics', () => {
    it('uses one cold repository request for projects, languages and stars', async () => {
      mockListForUser.mockResolvedValue({ data: mockRepos })
      mockGetByUsername.mockResolvedValue({
        data: {
          public_repos: 10,
          followers: 20,
        },
      })

      const snapshot = await getGitHubProjectSnapshot()

      // Total stars from valid repos: 100 + 90 + 80 + 50 = 320
      // (Filtered repos don't count? Logic in github.ts calls fetchRepositories which filters)

      expect(snapshot.stats).toEqual({ public_repos: 10, followers: 20, total_stars: 320 })
      expect(mockListForUser).toHaveBeenCalledTimes(1)
      expect(mockGetByUsername).toHaveBeenCalledTimes(1)
    })
  })
})
