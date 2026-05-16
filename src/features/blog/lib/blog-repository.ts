import type {
  BlogRepository,
  BlogRepositoryDependencies,
  CacheEnvelope,
  Post,
  PostDocument,
  PostIndexEntry,
} from './blog.types'
import { createBlogCacheStore } from './blog-cache-store'
import { GitHubBlogContentSource } from './blog-github-source'

const BLOG_CACHE_SCOPE = 'blog'
const LOCK_TTL_MS = 10_000

const TTL_CONFIG = {
  posts: { freshMs: 15 * 60_000, staleMs: 24 * 60 * 60_000 },
  post: { freshMs: 60 * 60_000, staleMs: 24 * 60 * 60_000 },
  index: { freshMs: 15 * 60_000, staleMs: 24 * 60 * 60_000 },
}

const logRepositoryWarning = (message: string, error: unknown): void => {
  console.warn(`blog-cache ${message}`, error)
}

const toEnvelope = <T>(value: T, freshMs: number, staleMs: number): CacheEnvelope<T> => {
  const now = Date.now()

  return {
    value,
    freshUntil: now + freshMs,
    staleUntil: now + staleMs,
    cachedAt: now,
    version: 1,
  }
}

const isPublicPost = (post: Post): boolean => {
  const today = new Date().toISOString().split('T')[0]
  const isPublished = post.metadata.published !== false
  const isFuture = post.metadata.date > today

  return isPublished && !isFuture
}

const sortPostsByDate = (posts: Post[]): Post[] => {
  return [...posts].sort((a, b) => (a.metadata.date > b.metadata.date ? -1 : 1))
}

const toPublicPost = (post: PostDocument): Post => ({
  slug: post.slug,
  metadata: post.metadata,
  content: post.content,
})

const getTtlSeconds = (staleMs: number): number => Math.max(1, Math.ceil(staleMs / 1000))

export const createBlogRepository = (
  dependencies: Partial<BlogRepositoryDependencies> = {},
): BlogRepository => {
  const cache = dependencies.cache ?? createBlogCacheStore()
  const source = dependencies.source ?? new GitHubBlogContentSource()
  const inflight = new Map<string, Promise<unknown>>()

  const withInflight = <T>(key: string, factory: () => Promise<T>): Promise<T> => {
    const existing = inflight.get(key)
    if (existing) {
      return existing as Promise<T>
    }

    const promise = factory().finally(() => inflight.delete(key))
    inflight.set(key, promise)
    return promise
  }

  const resolveNamespaceVersion = async (): Promise<string> => {
    return await cache.getNamespaceVersion(BLOG_CACHE_SCOPE)
  }

  const getPostsKey = (version: string, locale: string): string =>
    `blog:v${version}:posts:${locale}`
  const getIndexKey = (version: string, locale: string): string =>
    `blog:v${version}:index:${locale}`
  const getPostKey = (version: string, locale: string, slug: string): string =>
    `blog:v${version}:post:${locale}:${slug}`
  const getLockKey = (resource: string): string => `blog:lock:${resource}`

  const cachePostDocument = async (
    version: string,
    locale: string,
    document: PostDocument,
  ): Promise<void> => {
    await cache.set(
      getPostKey(version, locale, document.slug),
      toEnvelope(document, TTL_CONFIG.post.freshMs, TTL_CONFIG.post.staleMs),
      getTtlSeconds(TTL_CONFIG.post.staleMs),
    )
  }

  const getCachedOrSourceDocument = async (
    version: string,
    locale: string,
    entry: PostIndexEntry,
  ): Promise<PostDocument | null> => {
    const postKey = getPostKey(version, locale, entry.slug)
    const cachedDocument = await cache.get<PostDocument>(postKey)

    if (cachedDocument?.value.sha === entry.sha) {
      return cachedDocument.value
    }

    const document = await source.getPostDocument(locale, entry.slug, entry)
    if (!document) {
      return null
    }

    await cachePostDocument(version, locale, document)
    return document
  }

  const fetchAllPostsFromSource = async (version: string, locale: string): Promise<Post[]> => {
    const entries = await source.listPostIndex(locale)
    await cache.set(
      getIndexKey(version, locale),
      toEnvelope(entries, TTL_CONFIG.index.freshMs, TTL_CONFIG.index.staleMs),
      getTtlSeconds(TTL_CONFIG.index.staleMs),
    )

    const documents = await Promise.all(
      entries.map(async (entry) => await getCachedOrSourceDocument(version, locale, entry)),
    )

    const posts = documents
      .filter((document): document is PostDocument => document !== null)
      .map(toPublicPost)
      .filter(isPublicPost)

    const sortedPosts = sortPostsByDate(posts)

    await cache.set(
      getPostsKey(version, locale),
      toEnvelope(sortedPosts, TTL_CONFIG.posts.freshMs, TTL_CONFIG.posts.staleMs),
      getTtlSeconds(TTL_CONFIG.posts.staleMs),
    )

    return sortedPosts
  }

  const refreshPosts = async (
    version: string,
    locale: string,
    fallback: CacheEnvelope<Post[]> | null,
    background = false,
  ): Promise<Post[]> => {
    return await withInflight(`posts:${version}:${locale}`, async () => {
      const lockKey = getLockKey(`posts:${version}:${locale}`)
      const hasDistributedLock = cache.supportsLocks
        ? await cache.acquireLock(lockKey, LOCK_TTL_MS)
        : true

      if (background && cache.supportsLocks && !hasDistributedLock && fallback) {
        return fallback.value
      }

      try {
        return await fetchAllPostsFromSource(version, locale)
      } catch (error) {
        logRepositoryWarning(`source fetch failed for posts locale=${locale}`, error)
        return fallback !== null && fallback.staleUntil > Date.now() ? fallback.value : []
      } finally {
        if (cache.supportsLocks && hasDistributedLock) {
          await cache.releaseLock(lockKey)
        }
      }
    })
  }

  const refreshPost = async (
    version: string,
    slug: string,
    locale: string,
    fallback: CacheEnvelope<PostDocument> | null,
    background = false,
  ): Promise<Post | null> => {
    return await withInflight(`post:${version}:${locale}:${slug}`, async () => {
      const lockKey = getLockKey(`post:${version}:${locale}:${slug}`)
      const hasDistributedLock = cache.supportsLocks
        ? await cache.acquireLock(lockKey, LOCK_TTL_MS)
        : true

      if (background && cache.supportsLocks && !hasDistributedLock && fallback) {
        return toPublicPost(fallback.value)
      }

      try {
        const document = await source.getPostDocument(locale, slug)
        if (!document) {
          return null
        }

        await cachePostDocument(version, locale, document)
        return toPublicPost(document)
      } catch (error) {
        logRepositoryWarning(`source fetch failed for post locale=${locale} slug=${slug}`, error)
        return fallback !== null && fallback.staleUntil > Date.now()
          ? toPublicPost(fallback.value)
          : null
      } finally {
        if (cache.supportsLocks && hasDistributedLock) {
          await cache.releaseLock(lockKey)
        }
      }
    })
  }

  return {
    async getAllPosts(locale: string): Promise<Post[]> {
      const version = await resolveNamespaceVersion()
      const cacheKey = getPostsKey(version, locale)
      const cachedPosts = await cache.get<Post[]>(cacheKey)

      if (cachedPosts !== null && cachedPosts.freshUntil > Date.now()) {
        return cachedPosts.value
      }

      if (cachedPosts !== null && cachedPosts.staleUntil > Date.now()) {
        void refreshPosts(version, locale, cachedPosts, true)
        return cachedPosts.value
      }

      return await refreshPosts(version, locale, cachedPosts)
    },
    async getPostBySlug(slug: string, locale: string): Promise<Post | null> {
      const version = await resolveNamespaceVersion()
      const cacheKey = getPostKey(version, locale, slug)
      const cachedPost = await cache.get<PostDocument>(cacheKey)

      if (cachedPost !== null && cachedPost.freshUntil > Date.now()) {
        return toPublicPost(cachedPost.value)
      }

      if (cachedPost !== null && cachedPost.staleUntil > Date.now()) {
        void refreshPost(version, slug, locale, cachedPost, true)
        return toPublicPost(cachedPost.value)
      }

      return await refreshPost(version, slug, locale, cachedPost)
    },
  }
}
