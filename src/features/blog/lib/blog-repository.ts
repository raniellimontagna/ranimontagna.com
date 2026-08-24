import type {
  BlogRepository,
  BlogRepositoryDependencies,
  CacheEnvelope,
  Post,
  PostDocument,
  PostIndexEntry,
  PostSummary,
} from './blog.types'
import { createBlogCacheStore } from './blog-cache-store'
import {
  BLOG_CONTENT_POLICY_VERSION,
  validateBlogFrontmatter,
  validateBlogMarkdown,
} from './blog-content-policy'
import { GitHubBlogContentSource } from './blog-github-source'

const BLOG_CACHE_SCOPE = 'blog'
const BLOG_POLICY_CACHE_SEGMENT = `policy-v${BLOG_CONTENT_POLICY_VERSION}`
const LOCK_TTL_MS = 30_000
const LOCK_RENEW_INTERVAL_MS = 10_000

interface LockLease {
  lockKey: string
  token: string
  isOwned(): boolean
  markLost(): void
  stop(): Promise<void>
}

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
    version: BLOG_CONTENT_POLICY_VERSION,
  }
}

const isPublicPost = (post: PostSummary): boolean => {
  const today = new Date().toISOString().split('T')[0]
  const isPublished = post.metadata.published
  const isFuture = post.metadata.date > today

  return isPublished && !isFuture
}

const sortPostsByDate = <T extends PostSummary>(posts: T[]): T[] => {
  return [...posts].sort(
    (a, b) => b.metadata.date.localeCompare(a.metadata.date) || a.slug.localeCompare(b.slug),
  )
}

const toPublicPost = (post: PostDocument): Post => ({
  slug: post.slug,
  metadata: post.metadata,
  content: post.content,
})

const toValidatedPostSummary = (post: PostSummary): PostSummary | null => {
  try {
    const metadata = validateBlogFrontmatter(post.metadata, post.metadata.date)
    return isPublicPost({ ...post, metadata }) ? { slug: post.slug, metadata } : null
  } catch {
    return null
  }
}

const toPublicPostWithValidatedContent = (post: PostDocument): Post | null => {
  try {
    const metadata = validateBlogFrontmatter(post.metadata, post.metadata.date)
    const validated = { ...post, metadata }
    return isPublicPost(validated) ? toPublicPost(validated) : null
  } catch {
    return null
  }
}

const toPublicPostOrNull = async (post: PostDocument): Promise<Post | null> => {
  const publicPost = toPublicPostWithValidatedContent(post)
  if (!publicPost) return null

  try {
    await validateBlogMarkdown(publicPost.content)
    return publicPost
  } catch {
    return null
  }
}

const normalizePublicSummaries = (posts: PostSummary[]): PostSummary[] =>
  sortPostsByDate(
    posts.map(toValidatedPostSummary).filter((post): post is PostSummary => post !== null),
  )

const mapWithConcurrency = async <T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(values.length)
  let nextIndex = 0

  const worker = async (): Promise<void> => {
    while (nextIndex < values.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(values[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker))
  return results
}

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
    `blog:${BLOG_POLICY_CACHE_SEGMENT}:v${version}:posts:${locale}`
  const getIndexKey = (version: string, locale: string): string =>
    `blog:${BLOG_POLICY_CACHE_SEGMENT}:v${version}:index:${locale}`
  const getPostKey = (version: string, locale: string, slug: string): string =>
    `blog:${BLOG_POLICY_CACHE_SEGMENT}:v${version}:post:${locale}:${slug}`
  const getLockKey = (resource: string): string =>
    `blog:${BLOG_POLICY_CACHE_SEGMENT}:lock:${resource}`

  const startLockLease = (lockKey: string, token: string): LockLease => {
    let active = true
    let pendingRenewal = Promise.resolve()

    const markLost = (): void => {
      active = false
      clearInterval(timer)
    }

    const timer = setInterval(() => {
      pendingRenewal = pendingRenewal.then(async () => {
        if (!active) return
        const renewed = await cache.renewLock(lockKey, token, LOCK_TTL_MS)
        if (!renewed) {
          markLost()
        }
      })
    }, LOCK_RENEW_INTERVAL_MS)

    return {
      lockKey,
      token,
      isOwned: () => active,
      markLost,
      async stop(): Promise<void> {
        active = false
        clearInterval(timer)
        await pendingRenewal
        await cache.releaseLock(lockKey, token)
      },
    }
  }

  const writeCacheIfOwned = async <T>(
    key: string,
    envelope: CacheEnvelope<T>,
    ttlSeconds: number,
    lease: LockLease | null,
  ): Promise<boolean> => {
    if (!cache.supportsLocks) {
      await cache.set(key, envelope, ttlSeconds)
      return true
    }

    if (!lease?.isOwned()) {
      return false
    }

    const written = await cache.setIfLockOwned(
      lease.lockKey,
      lease.token,
      key,
      envelope,
      ttlSeconds,
    )
    if (!written) {
      lease.markLost()
    }
    return written
  }

  const cachePostDocument = async (
    version: string,
    locale: string,
    document: PostDocument,
    lease: LockLease | null,
  ): Promise<PostDocument> => {
    const metadata = validateBlogFrontmatter(document.metadata, document.metadata.date)
    await validateBlogMarkdown(document.content)
    const validatedDocument = { ...document, metadata }
    await writeCacheIfOwned(
      getPostKey(version, locale, document.slug),
      toEnvelope(validatedDocument, TTL_CONFIG.post.freshMs, TTL_CONFIG.post.staleMs),
      getTtlSeconds(TTL_CONFIG.post.staleMs),
      lease,
    )
    return validatedDocument
  }

  const getCachedOrSourceDocument = async (
    version: string,
    locale: string,
    entry: PostIndexEntry,
    lease: LockLease | null,
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

    return await cachePostDocument(version, locale, document, lease)
  }

  const fetchAllPostsFromSource = async (
    version: string,
    locale: string,
    lease: LockLease | null,
  ): Promise<PostSummary[]> => {
    const entries = await source.listPostIndex(locale)
    await writeCacheIfOwned(
      getIndexKey(version, locale),
      toEnvelope(entries, TTL_CONFIG.index.freshMs, TTL_CONFIG.index.staleMs),
      getTtlSeconds(TTL_CONFIG.index.staleMs),
      lease,
    )

    const documents = await mapWithConcurrency(entries, 4, async (entry) => {
      try {
        return await getCachedOrSourceDocument(version, locale, entry, lease)
      } catch (error) {
        logRepositoryWarning(`invalid document skipped locale=${locale} slug=${entry.slug}`, error)
        return null
      }
    })

    const summaries = documents
      .filter((document): document is PostDocument => document !== null)
      .map(toValidatedPostSummary)
      .filter((post): post is PostSummary => post !== null)

    const sortedPosts = sortPostsByDate(summaries)

    await writeCacheIfOwned(
      getPostsKey(version, locale),
      toEnvelope(sortedPosts, TTL_CONFIG.posts.freshMs, TTL_CONFIG.posts.staleMs),
      getTtlSeconds(TTL_CONFIG.posts.staleMs),
      lease,
    )

    return sortedPosts
  }

  const refreshPosts = async (
    version: string,
    locale: string,
    fallback: CacheEnvelope<PostSummary[]> | null,
    background = false,
  ): Promise<PostSummary[]> => {
    return await withInflight(`posts:${version}:${locale}`, async () => {
      const lockKey = getLockKey(`posts:${version}:${locale}`)
      const lockToken = cache.supportsLocks ? await cache.acquireLock(lockKey, LOCK_TTL_MS) : null

      if (background && cache.supportsLocks && lockToken === null && fallback) {
        return normalizePublicSummaries(fallback.value)
      }

      const lease = lockToken ? startLockLease(lockKey, lockToken) : null

      try {
        return await fetchAllPostsFromSource(version, locale, lease)
      } catch (error) {
        logRepositoryWarning(`source fetch failed for posts locale=${locale}`, error)
        return fallback !== null && fallback.staleUntil > Date.now()
          ? normalizePublicSummaries(fallback.value)
          : []
      } finally {
        await lease?.stop()
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
      const lockToken = cache.supportsLocks ? await cache.acquireLock(lockKey, LOCK_TTL_MS) : null

      if (background && cache.supportsLocks && lockToken === null && fallback) {
        return await toPublicPostOrNull(fallback.value)
      }

      const lease = lockToken ? startLockLease(lockKey, lockToken) : null

      try {
        const document = await source.getPostDocument(locale, slug)
        if (!document) {
          return null
        }

        const validatedDocument = await cachePostDocument(version, locale, document, lease)
        return toPublicPostWithValidatedContent(validatedDocument)
      } catch (error) {
        logRepositoryWarning(`source fetch failed for post locale=${locale} slug=${slug}`, error)
        return fallback !== null && fallback.staleUntil > Date.now()
          ? await toPublicPostOrNull(fallback.value)
          : null
      } finally {
        await lease?.stop()
      }
    })
  }

  return {
    async getAllPosts(locale: string): Promise<PostSummary[]> {
      const version = await resolveNamespaceVersion()
      const cacheKey = getPostsKey(version, locale)
      const cachedPosts = await cache.get<PostSummary[]>(cacheKey)

      if (cachedPosts !== null && cachedPosts.freshUntil > Date.now()) {
        return normalizePublicSummaries(cachedPosts.value)
      }

      if (cachedPosts !== null && cachedPosts.staleUntil > Date.now()) {
        void refreshPosts(version, locale, cachedPosts, true)
        return normalizePublicSummaries(cachedPosts.value)
      }

      return await refreshPosts(version, locale, cachedPosts)
    },
    async getPostBySlug(slug: string, locale: string): Promise<Post | null> {
      const version = await resolveNamespaceVersion()
      const cacheKey = getPostKey(version, locale, slug)
      const cachedPost = await cache.get<PostDocument>(cacheKey)

      if (cachedPost !== null && cachedPost.freshUntil > Date.now()) {
        return await toPublicPostOrNull(cachedPost.value)
      }

      if (cachedPost !== null && cachedPost.staleUntil > Date.now()) {
        void refreshPost(version, slug, locale, cachedPost, true)
        return await toPublicPostOrNull(cachedPost.value)
      }

      return await refreshPost(version, slug, locale, cachedPost)
    },
  }
}
