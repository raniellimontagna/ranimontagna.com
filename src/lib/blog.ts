import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'src/content/posts')

export interface Post {
  slug: string
  metadata: {
    title: string
    date: string
    description: string
    tags?: string[]
  }
  content: string
}

// Pattern: YYYY-MM-DD-slug.mdx
const DATE_PREFIX_REGEX = /^\d{4}-\d{2}-\d{2}-/

function extractSlugFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.mdx$/, '')
  // Remove date prefix if present (e.g., "2025-12-17-welcome" -> "welcome")
  return withoutExt.replace(DATE_PREFIX_REGEX, '')
}

function findPostFile(slug: string, locale: string): string | null {
  const localeDir = path.join(postsDirectory, locale)
  if (!fs.existsSync(localeDir)) return null

  const files = fs.readdirSync(localeDir).filter((file) => file.endsWith('.mdx'))
  // Find file that matches the slug (with or without date prefix)
  const matchingFile = files.find((file) => extractSlugFromFilename(file) === slug)
  return matchingFile || null
}

export function getPostBySlug(slug: string, locale: string): Post {
  const file = findPostFile(slug, locale)
  if (!file) {
    throw new Error(`Post not found: ${slug} (${locale})`)
  }

  const fullPath = path.join(postsDirectory, locale, file)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug: extractSlugFromFilename(file),
    metadata: data as Post['metadata'],
    content,
  }
}

function getPostFiles(locale: string): string[] {
  const localeDir = path.join(postsDirectory, locale)
  if (!fs.existsSync(localeDir)) return []
  return fs.readdirSync(localeDir).filter((file) => file.endsWith('.mdx'))
}

export function getAllPosts(locale: string): Post[] {
  const files = getPostFiles(locale)
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

  const posts = files
    .map((file: string) => {
      const slug = extractSlugFromFilename(file)
      return getPostBySlug(slug, locale)
    })
    // Filter out future posts (scheduled)
    .filter((post: Post) => post.metadata.date <= today)
    // Sort posts by date in descending order
    .sort((post1: Post, post2: Post) => (post1.metadata.date > post2.metadata.date ? -1 : 1))
  return posts
}

export function getAdjacentPosts(
  slug: string,
  locale: string,
): { prev: Post | null; next: Post | null } {
  const posts = getAllPosts(locale)
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
