# Blog Cache Design

Date: 2026-05-16
Project: `ranimontagna.com`
Scope: resilient Redis-backed cache for blog content with GitHub fallback

## Goal

Add a centralized cache layer for blog posts and derived categories that improves availability and reduces GitHub API pressure without making Redis a runtime dependency. Redis must be optional, fail-safe, and invisible to page rendering, SSR, SSG, metadata generation, and API routes.

## Current State

- Blog content is fetched directly from GitHub via Octokit in `src/features/blog/lib/blog.ts`.
- The public API exposed to the app is `getAllPosts(locale)`, `getPostBySlug(slug, locale)`, and `getAdjacentPosts(slug, locale)`.
- App Router surfaces such as blog pages, metadata, `head.tsx`, and `generateStaticParams()` already depend on these functions.
- `unstable_cache` with the `posts` tag is already present and `src/app/api/revalidate/route.ts` revalidates that tag.
- The chat layer already treats Redis as optional and falls back safely when unavailable.

## Requirements

- Redis failures must never break page rendering or route execution.
- Local development must work without Redis configuration.
- Cache behavior must be centralized, typed, and testable.
- The system should reduce repeated GitHub fetches and lower rate-limit pressure.
- Stale content may be served when it preserves availability.
- The architecture should allow replacing GitHub as the content source later without touching page code.

## Recommended Architecture

### Public facade

Keep `src/features/blog/lib/blog.ts` as the public facade used by the rest of the app. It should keep exporting:

- `getAllPosts(locale)`
- `getPostBySlug(slug, locale)`
- `getAdjacentPosts(slug, locale)`
- `getCategories(locale)` if categories are exposed now or later

The facade should delegate to a repository instead of talking to Octokit directly.

### Source abstraction

Create a `BlogContentSource` interface for origin reads:

- `listPostIndex(locale): Promise<PostIndexEntry[]>`
- `getPostDocument(locale, slug): Promise<PostDocument | null>`

`PostIndexEntry` should contain enough information to avoid refetching unchanged content, including at least:

- `slug`
- `path`
- `sha`
- `filenameDate`

`GitHubBlogContentSource` becomes the initial implementation. A future CMS or filesystem source only needs to implement the same interface.

### Cache abstraction

Create a central `BlogCacheStore` abstraction with best-effort methods:

- `get<T>(key): Promise<CacheEnvelope<T> | null>`
- `set<T>(key, value, ttlSeconds): Promise<void>`
- `delete(key): Promise<void>`
- `acquireLock(key, ttlMs): Promise<boolean>`
- `releaseLock(key): Promise<void>`
- `getNamespaceVersion(scope): Promise<string>`
- `bumpNamespaceVersion(scope): Promise<string>`

Provide two implementations:

- `RedisBlogCacheStore` using Upstash Redis REST when configured
- `NoopBlogCacheStore` when Redis is absent

Any cache-store exception must be caught and converted into a cache miss or skipped write. The application must never throw because of cache I/O.

### Repository

`BlogRepository` becomes the decision layer:

- Reads from cache first
- Serves fresh cached data when available
- Serves stale cached data when available and triggers refresh
- Falls back to source when cache is absent or unusable
- Writes back to cache best-effort
- Returns stale data if the source fails after a stale hit exists
- Returns the current safe behavior (`[]` or `null`) if both source access and cache fallback fail

## Cache Model

Use a typed envelope:

```ts
interface CacheEnvelope<T> {
  value: T
  freshUntil: number
  staleUntil: number
  cachedAt: number
  version: number
}
```

Recommended keys:

- `blog:v{n}:index:{locale}`
- `blog:v{n}:posts:{locale}`
- `blog:v{n}:post:{locale}:{slug}`
- `blog:v{n}:categories:{locale}`
- `blog:v{n}:lock:{resource}`

`v{n}` comes from a namespace version so invalidation does not require broad deletion.

## Freshness Policy

Recommended initial policy:

- post list by locale: fresh `15m`, stale `24h`
- post by slug: fresh `1h`, stale `24h`
- categories by locale: fresh `30m`, stale `24h`

These values are intentionally conservative for availability and GitHub rate-limit protection. They can be made configurable later.

## Stale-While-Revalidate

Use stale-while-revalidate in the repository:

- If the cache entry is fresh, return it.
- If the entry is stale but still within `staleUntil`, return it immediately and trigger a background refresh.
- If there is no usable cache entry, fetch from the source synchronously.
- If the source fails and a stale entry exists, return stale.

This is appropriate for the blog because content freshness is not critical to the second and push-triggered revalidation already exists.

## Stampede Protection

Use two layers:

- Process-local in-flight coalescing with `Map<string, Promise<unknown>>`
- Cross-instance Redis lock with `SET NX PX` semantics through `acquireLock`

Behavior:

- If one request is already refreshing a key in the same process, reuse that promise.
- If a stale value exists and the distributed lock cannot be acquired, serve stale instead of blocking.
- If there is no cached value and the lock cannot be acquired, wait briefly for the local in-flight promise if available, otherwise fetch from source.

This keeps the implementation practical without requiring a heavyweight coordination system.

## GitHub Rate-Limit Strategy

Reduce origin calls with three measures:

1. Cache parsed posts and derived categories aggressively.
2. Cache the locale index separately with `slug`, `path`, and `sha`.
3. During refresh, compare current index entries to cached `sha` values and only refetch post documents whose `sha` changed.

This is materially better than the current behavior, which can list the directory and then download every post body again.

If GitHub later returns `ETag` or other cheaper validation opportunities in this flow, those can be added behind `BlogContentSource` without touching the repository.

## Invalidation Strategy

Keep Next cache invalidation and add Redis namespace invalidation.

On `POST /api/revalidate`:

- keep `revalidateTag('posts', 'max')`
- add best-effort `invalidateBlogCache()` that bumps the namespace version used by the blog cache

If Redis is down during invalidation:

- the route should still return success if Next revalidation succeeds
- the failure should only be logged for observability

This keeps the current webhook path intact while making external cache invalidation cheap.

## SSR, SSG, ISR, And Streaming Impact

- SSR must keep receiving plain `Post[]` or `null` results, never cache exceptions.
- `generateStaticParams()` continues to call the same facade and benefits from reduced GitHub pressure.
- `generateMetadata()` and `head.tsx` should use the same repository-backed facade without behavioral changes.
- `unstable_cache` should remain as a thin App Router cache layer with the `posts` tag, but freshness decisions should move to the repository and Redis envelope.
- Streaming must not depend on Redis availability; all Redis reads and writes are optional best-effort operations.

No page should gain a hard dependency on Redis presence or timing.

## Logging And Observability

Log only significant cache events:

- Redis unavailable on initialization
- cache read failure
- cache write failure
- lock acquisition failure if it affects refresh coordination
- source fetch failure with stale fallback activation

Use concise structured messages with a stable prefix such as `blog-cache`. Avoid logging on every cache hit or miss to prevent console noise.

## Testing Strategy

Add strong test coverage in three layers.

### Cache store tests

- missing Redis config returns `NoopBlogCacheStore`
- Redis read/write/lock failures degrade to safe behavior
- serialization and deserialization failures become misses, not thrown errors

### Repository tests

- returns fresh cache hits
- returns stale cache hits and triggers refresh
- falls back to source on cache miss
- returns stale when source fails
- returns safe empty/null shapes when both cache and source paths fail
- coalesces concurrent refreshes
- respects lock behavior

### Public API and integration tests

- `getAllPosts`, `getPostBySlug`, and `getAdjacentPosts` keep current contracts
- revalidate route calls both Next tag revalidation and best-effort blog-cache invalidation
- App Router consumers continue rendering when the cache layer reports failures

## Migration Plan

1. Extract GitHub reads from `blog.ts` into `GitHubBlogContentSource`.
2. Introduce cache abstractions and resilient Redis implementation.
3. Implement `BlogRepository` with SWR and stampede protection.
4. Rewire `blog.ts` public functions to use the repository.
5. Extend revalidation route with best-effort blog cache invalidation.
6. Add tests for failure modes and concurrency.
7. Verify local behavior with no Redis environment configured.

## Non-Goals

- Replacing GitHub as the content source in this change
- Building a full CMS sync pipeline
- Adding admin cache controls
- Broad refactors outside the blog data-access boundary

## Decision Summary

The blog cache layer will use Redis when available, but Redis will never be required for correctness. The repository will prefer availability through stale-while-revalidate, safe fallbacks, and best-effort invalidation. The public blog API used by the App Router remains stable, while the data-access internals become source-agnostic and ready for future origin changes.
