import { unstable_cache } from 'next/cache'
import type { Post } from './blog.types'
import { createBlogRepository } from './blog-repository'

export type { Post } from './blog.types'

const repository = createBlogRepository()

/**
 * Fetch a post with cache (revalidates every 60 seconds)
 */
export const getPostBySlug = unstable_cache(
  async (slug: string, locale: string) => {
    return await repository.getPostBySlug(slug, locale)
  },
  ['post-by-slug'],
  {
    revalidate: 300,
    tags: ['posts'],
  },
)

/**
 * Fetch all posts with cache (revalidates every 60 seconds)
 */
export const getAllPosts = unstable_cache(
  async (locale: string) => {
    return await repository.getAllPosts(locale)
  },
  ['all-posts'],
  {
    revalidate: 300,
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
