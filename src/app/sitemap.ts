import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
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
  ])

  return [...routes, ...localizedRoutes]
}
