import type { GitHubProjectSnapshot, GitHubStats, Repository } from '../types/github.types'
import { getLanguagesFromRepos } from './project-presentation'

const FEATURED_REPOSITORY_COUNT = 3
const REGULAR_REPOSITORY_COUNT = 27

type GitHubRepositorySource = {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage?: string | null
  language?: string | null
  stargazers_count?: number
  forks_count?: number
  updated_at?: string | null
  topics?: string[]
  fork?: boolean
}

type GitHubUserSource = Pick<GitHubStats, 'public_repos' | 'followers'>

export type GitHubSnapshotDependencies = {
  listRepositories: () => Promise<{ data: GitHubRepositorySource[] }>
  getUser: () => Promise<{ data: GitHubUserSource }>
  now?: () => Date
  reportError?: (message: string, error: unknown) => void
}

export function createGitHubProjectSnapshotLoader({
  listRepositories,
  getUser,
  now = () => new Date(),
  reportError = (message, error) => console.error(message, error),
}: GitHubSnapshotDependencies): () => Promise<GitHubProjectSnapshot> {
  const fetchRepositories = async (): Promise<Repository[]> => {
    try {
      const { data } = await listRepositories()
      const twoYearsAgo = now()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

      return data
        .filter(
          (repository) =>
            !repository.fork &&
            repository.updated_at &&
            new Date(repository.updated_at) > twoYearsAgo,
        )
        .map((repository) => ({
          id: repository.id,
          name: repository.name,
          description: repository.description,
          html_url: repository.html_url,
          homepage: repository.homepage ?? null,
          language: repository.language ?? null,
          stargazers_count: repository.stargazers_count ?? 0,
          forks_count: repository.forks_count ?? 0,
          updated_at: repository.updated_at || '',
          topics: repository.topics || [],
          fork: repository.fork ?? false,
        }))
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
    } catch (error) {
      reportError('Error fetching repositories:', error)
      return []
    }
  }

  const fetchUserStats = async (): Promise<Omit<GitHubStats, 'total_stars'>> => {
    try {
      const { data } = await getUser()
      return { public_repos: data.public_repos, followers: data.followers }
    } catch (error) {
      reportError('Error fetching GitHub stats:', error)
      return { public_repos: 0, followers: 0 }
    }
  }

  return async () => {
    const [repositories, userStats] = await Promise.all([fetchRepositories(), fetchUserStats()])
    const visibleRepositories = repositories.slice(
      0,
      FEATURED_REPOSITORY_COUNT + REGULAR_REPOSITORY_COUNT,
    )

    return {
      featuredRepos: visibleRepositories.slice(0, FEATURED_REPOSITORY_COUNT),
      repos: visibleRepositories.slice(FEATURED_REPOSITORY_COUNT),
      languages: getLanguagesFromRepos(visibleRepositories),
      stats: {
        ...userStats,
        total_stars: repositories.reduce(
          (total, repository) => total + repository.stargazers_count,
          0,
        ),
      },
    }
  }
}
