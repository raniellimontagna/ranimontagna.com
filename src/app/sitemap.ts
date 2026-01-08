import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/features/blog/lib/blog'
import { locales } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL
  const languages = locales.map((loc) => loc.code)

  const localizedRoutes = languages.flatMap((lang) => [
    {
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/${lang}/blog`,
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
        url: `${baseUrl}/${lang}/blog/${post.slug}`,
        lastModified: new Date(post.metadata.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })
    }
  }

  return [...localizedRoutes, ...blogPosts]
}
