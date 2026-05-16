import { Octokit } from '@octokit/rest'
import matter from 'gray-matter'
import type { BlogContentSource, PostDocument, PostIndexEntry } from './blog.types'

interface GitHubFile {
  name: string
  path: string
  sha: string
  type: 'file' | 'dir'
  content?: string
}

const REPO_OWNER = process.env.GITHUB_OWNER || 'raniellimontagna'
const REPO_NAME = process.env.GITHUB_REPO || 'ranimontagna-blog-content'

const parseFilename = (filename: string): { date: string; slug: string } | null => {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.mdx$/)
  if (!match) return null

  const [, date, slug] = match
  return { date, slug }
}

const parsePostDocument = (entry: PostIndexEntry, content: string): PostDocument => {
  const { data: frontmatter, content: markdown } = matter(content)

  return {
    slug: entry.slug,
    path: entry.path,
    sha: entry.sha,
    metadata: {
      title: frontmatter.title || '',
      date: frontmatter.date || entry.filenameDate,
      description: frontmatter.description || '',
      tags: frontmatter.tags || [],
      published: frontmatter.published !== false,
      coverImage: frontmatter.coverImage || undefined,
    },
    content: markdown,
  }
}

export class GitHubBlogContentSource implements BlogContentSource {
  private readonly octokit: Octokit

  constructor(
    octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    }),
  ) {
    this.octokit = octokit
  }

  async listPostIndex(locale: string): Promise<PostIndexEntry[]> {
    const { data } = await this.octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `posts/${locale}`,
    })

    if (!Array.isArray(data)) {
      return []
    }

    return (data as GitHubFile[])
      .filter((file) => file.type === 'file' && file.name.endsWith('.mdx'))
      .map((file) => {
        const parsed = parseFilename(file.name)
        if (!parsed) return null

        return {
          slug: parsed.slug,
          path: file.path,
          sha: file.sha,
          filenameDate: parsed.date,
        } satisfies PostIndexEntry
      })
      .filter((entry): entry is PostIndexEntry => entry !== null)
  }

  async getPostDocument(
    locale: string,
    slug: string,
    entry?: PostIndexEntry,
  ): Promise<PostDocument | null> {
    const resolvedEntry =
      entry ??
      (await this.listPostIndex(locale)).find((indexEntry) => indexEntry.slug === slug) ??
      null

    if (!resolvedEntry) {
      return null
    }

    const { data } = await this.octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: resolvedEntry.path,
    })

    if (!('content' in data) || !data.content) {
      return null
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return parsePostDocument(resolvedEntry, content)
  }
}
