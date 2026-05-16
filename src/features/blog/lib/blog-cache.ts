import { createBlogCacheStore } from './blog-cache-store'

export const invalidateBlogCache = async (): Promise<void> => {
  const cacheStore = createBlogCacheStore()
  await cacheStore.bumpNamespaceVersion('blog')
}
