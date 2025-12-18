import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/routing'
import { getAllPosts } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ranimontagna.com'
  const languages = locales.map((loc) => loc.code)

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
  ]

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

  return [...routes, ...localizedRoutes, ...blogPosts]
}
