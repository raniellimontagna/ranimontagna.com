export interface PostMetadata {
  title: string
  date: string
  description: string
  tags: string[]
  published: boolean
  coverImage?: string
}

export interface PostSummary {
  slug: string
  metadata: PostMetadata
}

export interface Post extends PostSummary {
  content: string
}

export interface PostIndexEntry {
  slug: string
  path: string
  sha: string
  filenameDate: string
}

export interface PostDocument extends Post {
  sha: string
  path: string
}

export interface CacheEnvelope<T> {
  value: T
  freshUntil: number
  staleUntil: number
  cachedAt: number
  version: number
}

export interface BlogContentSource {
  listPostIndex(locale: string): Promise<PostIndexEntry[]>
  getPostDocument(
    locale: string,
    slug: string,
    entry?: PostIndexEntry,
  ): Promise<PostDocument | null>
}

export interface BlogCacheStore {
  supportsLocks: boolean
  get<T>(key: string): Promise<CacheEnvelope<T> | null>
  set<T>(key: string, envelope: CacheEnvelope<T>, ttlSeconds: number): Promise<void>
  setIfLockOwned<T>(
    lockKey: string,
    token: string,
    key: string,
    envelope: CacheEnvelope<T>,
    ttlSeconds: number,
  ): Promise<boolean>
  delete(key: string): Promise<void>
  acquireLock(key: string, ttlMs: number): Promise<string | null>
  renewLock(key: string, token: string, ttlMs: number): Promise<boolean>
  releaseLock(key: string, token: string): Promise<boolean>
  getNamespaceVersion(scope: string): Promise<string>
  bumpNamespaceVersion(scope: string): Promise<string>
}

export interface BlogRepository {
  getAllPosts(locale: string): Promise<PostSummary[]>
  getPostBySlug(slug: string, locale: string): Promise<Post | null>
}

export interface BlogRepositoryDependencies {
  cache: BlogCacheStore
  source: BlogContentSource
}
