import 'server-only'

import { Octokit } from '@octokit/rest'
import { unstable_cache } from 'next/cache'
import { createGitHubProjectSnapshotLoader } from './github-snapshot'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const GITHUB_USERNAME = process.env.GITHUB_OWNER || 'raniellimontagna'

const fetchGitHubProjectSnapshot = createGitHubProjectSnapshotLoader({
  listRepositories: () =>
    octokit.repos.listForUser({
      username: GITHUB_USERNAME,
      type: 'owner',
      sort: 'updated',
      per_page: 100,
    }),
  getUser: () => octokit.users.getByUsername({ username: GITHUB_USERNAME }),
})

/**
 * Server-only cache boundary. Client modules must import DTOs and presentation
 * helpers from their dedicated modules instead of this Octokit entry point.
 */
export const getGitHubProjectSnapshot = unstable_cache(
  fetchGitHubProjectSnapshot,
  ['github-project-snapshot'],
  { revalidate: 3600, tags: ['github'] },
)
