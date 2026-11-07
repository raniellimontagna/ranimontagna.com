import { getTranslations, setRequestLocale } from 'next-intl/server'
import { BlogIndex } from '@/features/blog/components/blog-index'
import { getAllPosts, type PostSummary } from '@/features/blog/lib/blog'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'
import { generateBlogJsonLd, serializeJsonLd } from '@/shared/lib/jsonld'

function getBlogUrl(locale: string): string {
  const isDefault = locale === routing.defaultLocale
  return isDefault ? `${BASE_URL}/blog` : `${BASE_URL}/${locale}/blog`
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })

  const url = getBlogUrl(locale)
  const keywords = t.has('keywords') ? t('keywords') : undefined

  return {
    title: t('title'),
    description: t('subtitle'),
    keywords,
    authors: [{ name: 'Ranielli Montagna', url: BASE_URL }],
    creator: 'Ranielli Montagna',
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url,
      siteName: 'Ranielli Montagna',
      locale: locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('subtitle'),
      creator: '@rannimontagna',
    },
    alternates: {
      canonical: url,
      languages: {
        'x-default': `${BASE_URL}/blog`,
        pt: `${BASE_URL}/blog`,
        en: `${BASE_URL}/en/blog`,
        es: `${BASE_URL}/es/blog`,
      },
    },
  }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'blog' })
  let posts: PostSummary[] = []
  try {
    posts = await getAllPosts(locale)
  } catch {
    // GitHub unreachable or rate limited: the index shows its empty state.
  }
  const blogUrl = getBlogUrl(locale)
  const jsonLd = generateBlogJsonLd({
    url: blogUrl,
    locale,
    name: t('title'),
    description: t('subtitle'),
    posts: posts.map((post) => ({
      slug: post.slug,
      title: post.metadata.title,
      description: post.metadata.description,
      date: post.metadata.date,
      tags: post.metadata.tags ?? [],
    })),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      {await BlogIndex({ posts, locale })}
    </>
  )
}
