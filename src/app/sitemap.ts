import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/features/blog/lib/blog'
import { locales, routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'

/**
 * Returns canonical URL for a given locale and optional path segment.
 * Default locale (pt) is served at root (no locale prefix).
 */
function getLocalizedUrl(lang: string, path = ''): string {
  const isDefault = lang === routing.defaultLocale
  const base = isDefault ? BASE_URL : `${BASE_URL}/${lang}`
  return path ? `${base}/${path}` : base
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const languages = locales.map((loc) => loc.code)

  const localizedRoutes = languages.flatMap((lang) => [
    {
      url: getLocalizedUrl(lang),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    },
    {
      url: getLocalizedUrl(lang, 'blog'),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: getLocalizedUrl(lang, 'projects'),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ])

  // Add blog posts to sitemap
  const blogPosts: MetadataRoute.Sitemap = []
  for (const lang of languages) {
    const posts = await getAllPosts(lang)
    for (const post of posts) {
      blogPosts.push({
        url: getLocalizedUrl(lang, `blog/${post.slug}`),
        lastModified: new Date(post.metadata.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })
    }
  }

  return [...localizedRoutes, ...blogPosts]
}
