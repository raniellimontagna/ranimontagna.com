import { Octokit } from '@octokit/rest'
import matter from 'gray-matter'
import { unstable_cache } from 'next/cache'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

const REPO_OWNER = process.env.GITHUB_OWNER || 'raniellimontagna'
const REPO_NAME = process.env.GITHUB_REPO || 'ranimontagna-blog-content'

export interface Post {
  slug: string
  metadata: {
    title: string
    date: string
    description: string
    tags?: string[]
    published?: boolean
  }
  content: string
}

interface GitHubFile {
  name: string
  path: string
  sha: string
  type: 'file' | 'dir'
  content?: string
}

/**
 * Extract slug and date from filename
 * Pattern: YYYY-MM-DD-slug.mdx
 */
function parseFilename(filename: string): { date: string; slug: string } | null {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.mdx$/)
  if (!match) return null

  const [, date, slug] = match
  return { date, slug }
}

/**
 * Fetch a specific post by slug and locale
 */
async function fetchPostBySlug(slug: string, locale: string): Promise<Post | null> {
  try {
    // List files in the locale directory
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `posts/${locale}`,
    })

    if (!Array.isArray(data)) return null

    // Find the file that matches the slug
    const file = (data as GitHubFile[]).find((f) => {
      if (f.type !== 'file' || !f.name.endsWith('.mdx')) return false
      const parsed = parseFilename(f.name)
      return parsed?.slug === slug
    })

    if (!file) return null

    // Fetch file content
    const { data: fileData } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: file.path,
    })

    if (!('content' in fileData) || !fileData.content) return null

    const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
    const { data: frontmatter, content: markdown } = matter(content)

    return {
      slug,
      metadata: {
        title: frontmatter.title || '',
        date: frontmatter.date || '',
        description: frontmatter.description || '',
        tags: frontmatter.tags || [],
        published: frontmatter.published !== false, // Default true
      },
      content: markdown,
    }
  } catch (error) {
    console.error(`Error fetching post ${slug} for locale ${locale}:`, error)
    return null
  }
}

/**
 * Fetch all posts for a locale
 */
async function fetchAllPosts(locale: string): Promise<Post[]> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `posts/${locale}`,
    })

    if (!Array.isArray(data)) return []

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Filter valid MDX files
    const validFiles = (data as GitHubFile[]).filter((file) => {
      if (file.type !== 'file' || !file.name.endsWith('.mdx')) return false
      return parseFilename(file.name) !== null
    })

    // Fetch all file contents in parallel
    const postPromises = validFiles.map(async (file) => {
      const parsed = parseFilename(file.name)
      if (!parsed) return null

      try {
        // Fetch file content
        const { data: fileData } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: file.path,
        })

        if (!('content' in fileData) || !fileData.content) return null

        const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
        const { data: frontmatter, content: markdown } = matter(content)

        // Filter unpublished and future posts
        const isPublished = frontmatter.published !== false
        const isFuture = frontmatter.date > today

        if (!isPublished || isFuture) return null

        return {
          slug: parsed.slug,
          metadata: {
            title: frontmatter.title || '',
            date: frontmatter.date || parsed.date,
            description: frontmatter.description || '',
            tags: frontmatter.tags || [],
            published: isPublished,
          },
          content: markdown,
        } satisfies Post
      } catch (error) {
        console.error(`Error fetching post ${file.name}:`, error)
        return null
      }
    })

    // Wait for all posts to be fetched
    const postsResults = await Promise.all(postPromises)

    // Filter out null results and sort by date (newest first)
    const posts = postsResults.filter((post) => post !== null) as Post[]
    return posts.sort((a, b) => (a.metadata.date > b.metadata.date ? -1 : 1))
  } catch (error) {
    console.error(`Error fetching posts for locale ${locale}:`, error)
    return []
  }
}

/**
 * Fetch a post with cache (revalidates every 60 seconds)
 */
export const getPostBySlug = unstable_cache(
  async (slug: string, locale: string) => {
    const post = await fetchPostBySlug(slug, locale)
    if (!post) {
      throw new Error(`Post not found: ${slug} (${locale})`)
    }
    return post
  },
  ['post-by-slug'],
  {
    revalidate: 3600, // Revalidate every 1 hour
    tags: ['posts'],
  },
)

/**
 * Fetch all posts with cache (revalidates every 60 seconds)
 */
export const getAllPosts = unstable_cache(
  async (locale: string) => {
    return await fetchAllPosts(locale)
  },
  ['all-posts'],
  {
    revalidate: 3600, // Revalidate every 1 hour
    tags: ['posts'],
  },
)

/**
 * Fetch adjacent posts (previous and next)
 */
export async function getAdjacentPosts(
  slug: string,
  locale: string,
): Promise<{ prev: Post | null; next: Post | null }> {
  const posts = await getAllPosts(locale)
  const index = posts.findIndex((post) => post.slug === slug)

  if (index === -1) {
    return { prev: null, next: null }
  }

  return {
    // Next = newer (index - 1), Prev = older (index + 1) since posts are sorted desc
    next: index > 0 ? posts[index - 1] : null,
    prev: index < posts.length - 1 ? posts[index + 1] : null,
  }
}
