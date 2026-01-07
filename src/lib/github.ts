import { Octokit } from '@octokit/rest'
import { unstable_cache } from 'next/cache'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

const GITHUB_USERNAME = process.env.GITHUB_OWNER || 'raniellimontagna'

export interface Repository {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  topics: string[]
  fork: boolean
}

export interface GitHubStats {
  public_repos: number
  followers: number
  total_stars: number
}

// Language colors based on GitHub's linguist
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
}

/**
 * Fetch all public repositories for the user
 */
async function fetchRepositories(): Promise<Repository[]> {
  try {
    const { data } = await octokit.repos.listForUser({
      username: GITHUB_USERNAME,
      type: 'owner',
      sort: 'updated',
      per_page: 100,
    })

    // Filter out forks and repositories inactive for more than 2 years
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    const repos: Repository[] = data
      .filter((repo) => !repo.fork && repo.updated_at && new Date(repo.updated_at) > twoYearsAgo)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        homepage: repo.homepage ?? null,
        language: repo.language ?? null,
        stargazers_count: repo.stargazers_count ?? 0,
        forks_count: repo.forks_count ?? 0,
        updated_at: repo.updated_at || '',
        topics: repo.topics || [],
        fork: repo.fork ?? false,
      }))

    // Sort by stars (descending)
    return repos.sort((a, b) => b.stargazers_count - a.stargazers_count)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return []
  }
}

/**
 * Fetch GitHub user stats
 */
async function fetchGitHubStats(): Promise<GitHubStats> {
  try {
    const { data: user } = await octokit.users.getByUsername({
      username: GITHUB_USERNAME,
    })

    // Calculate total stars
    const repos = await fetchRepositories()
    const total_stars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)

    return {
      public_repos: user.public_repos,
      followers: user.followers,
      total_stars,
    }
  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    return {
      public_repos: 0,
      followers: 0,
      total_stars: 0,
    }
  }
}

/**
 * Get unique languages from repositories
 */
export function getLanguagesFromRepos(repos: Repository[]): string[] {
  const languages = new Set<string>()
  for (const repo of repos) {
    if (repo.language) {
      languages.add(repo.language)
    }
  }
  return Array.from(languages).sort()
}

/**
 * Cached version of getRepositories (revalidates every hour)
 */
export const getRepositories = unstable_cache(
  async () => {
    return await fetchRepositories()
  },
  ['github-repositories'],
  {
    revalidate: 3600, // 1 hour
    tags: ['github'],
  },
)

/**
 * Cached version of getGitHubStats (revalidates every hour)
 */
export const getGitHubStats = unstable_cache(
  async () => {
    return await fetchGitHubStats()
  },
  ['github-stats'],
  {
    revalidate: 3600, // 1 hour
    tags: ['github'],
  },
)

/**
 * Get featured repositories (top 3 by stars)
 */
export async function getFeaturedRepositories(): Promise<Repository[]> {
  const repos = await getRepositories()
  return repos.slice(0, 3)
}

/**
 * Get repositories excluding featured ones
 */
export async function getRegularRepositories(limit = 30): Promise<Repository[]> {
  const repos = await getRepositories()
  return repos.slice(3, limit + 3)
}
