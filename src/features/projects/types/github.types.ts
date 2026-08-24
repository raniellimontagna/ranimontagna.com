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

export interface GitHubProjectSnapshot {
  featuredRepos: Repository[]
  repos: Repository[]
  languages: string[]
  stats: GitHubStats
}
