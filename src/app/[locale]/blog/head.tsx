import { getTranslations } from 'next-intl/server'
import { getAllPosts } from '@/features/blog/lib/blog'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'

function getBlogUrl(locale: string): string {
  const isDefault = locale === routing.defaultLocale
  return isDefault ? `${BASE_URL}/blog` : `${BASE_URL}/${locale}/blog`
}

export default async function Head({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const posts = await getAllPosts(locale)
  const blogUrl = getBlogUrl(locale)

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${blogUrl}#blog`,
    name: t('title'),
    description: t('subtitle'),
    url: blogUrl,
    inLanguage: locale,
    author: {
      '@type': 'Person',
      name: 'Ranielli Montagna',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Ranielli Montagna',
      url: BASE_URL,
    },
    blogPost: posts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.metadata.title,
      description: post.metadata.description,
      datePublished: post.metadata.date,
      url: `${blogUrl}/${post.slug}`,
      author: {
        '@type': 'Person',
        name: 'Ranielli Montagna',
      },
      keywords: post.metadata.tags?.join(', '),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
    />
  )
}
