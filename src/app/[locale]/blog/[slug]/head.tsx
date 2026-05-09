import { getPostBySlug } from '@/features/blog/lib/blog'
import { resolveBlogImageUrl } from '@/features/blog/lib/media'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'

function getPostUrl(locale: string, slug: string): string {
  const isDefault = locale === routing.defaultLocale
  return isDefault ? `${BASE_URL}/blog/${slug}` : `${BASE_URL}/${locale}/blog/${slug}`
}

export default async function Head({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug, locale)

  if (!post) {
    return null
  }

  const url = getPostUrl(locale, slug)
  const imageUrl = resolveBlogImageUrl(post.metadata.coverImage)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#blogposting`,
    headline: post.metadata.title,
    description: post.metadata.description,
    image: imageUrl ? [imageUrl] : [`${BASE_URL}/og-image.png`],
    datePublished: post.metadata.date,
    dateModified: post.metadata.date,
    author: {
      '@type': 'Person',
      name: 'Ranielli Montagna',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Ranielli Montagna',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo/white.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    isPartOf: {
      '@type': 'Blog',
      '@id': `${BASE_URL}/blog`,
      name: 'Ranielli Montagna Blog',
      url: `${BASE_URL}/blog`,
    },
    keywords: post.metadata.tags?.join(', '),
    articleSection: 'Technology',
    inLanguage: locale,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: post.metadata.title, item: url },
      ],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
