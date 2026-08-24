import { Octokit } from '@octokit/rest'
import { unstable_cache } from 'next/cache'
import type {
  GitHubProjectSnapshot,
  GitHubStats,
  Repository,
} from '@/features/projects/types/github.types'
import { getLanguagesFromRepos } from './project-presentation'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const GITHUB_USERNAME = process.env.GITHUB_OWNER || 'raniellimontagna'
const FEATURED_REPOSITORY_COUNT = 3
const REGULAR_REPOSITORY_COUNT = 27

async function fetchRepositories(): Promise<Repository[]> {
  try {
    const { data } = await octokit.repos.listForUser({
      username: GITHUB_USERNAME,
      type: 'owner',
      sort: 'updated',
      per_page: 100,
    })
    const twoYearsAgo = new Date()
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
    console.error('Error fetching repositories:', error)
    return []
  }
}

async function fetchUserStats(): Promise<Omit<GitHubStats, 'total_stars'>> {
  try {
    const { data } = await octokit.users.getByUsername({ username: GITHUB_USERNAME })
    return { public_repos: data.public_repos, followers: data.followers }
  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    return { public_repos: 0, followers: 0 }
  }
}

async function fetchGitHubProjectSnapshot(): Promise<GitHubProjectSnapshot> {
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

/**
 * Server-only cache boundary. Client modules must import DTOs and presentation
 * helpers from their dedicated modules instead of this Octokit entry point.
 */
export const getGitHubProjectSnapshot = unstable_cache(
  fetchGitHubProjectSnapshot,
  ['github-project-snapshot'],
  { revalidate: 3600, tags: ['github'] },
)
