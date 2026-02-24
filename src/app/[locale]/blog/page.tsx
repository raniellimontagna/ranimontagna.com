import { getTranslations } from 'next-intl/server'
import { FeaturedPost, PostCard } from '@/features/blog/components'
import { getAllPosts } from '@/features/blog/lib/blog'
import { Breadcrumbs } from '@/shared/components/ui'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'

function getBlogUrl(locale: string): string {
  const isDefault = locale === routing.defaultLocale
  return isDefault ? `${BASE_URL}/blog` : `${BASE_URL}/${locale}/blog`
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('blog')

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
  const t = await getTranslations('blog')
  const posts = await getAllPosts(locale)
  const featuredPost = posts[0]
  const remainingPosts = posts.slice(1)

  const blogUrl = getBlogUrl(locale)

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${blogUrl}#blog`,
    name: 'Ranielli Montagna Blog',
    description: t('subtitle'),
    url: blogUrl,
    author: {
      '@type': 'Person',
      name: 'Ranielli Montagna',
      '@id': `${BASE_URL}/#person`,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Ranielli Montagna',
      url: BASE_URL,
    },
    inLanguage: locale,
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
    <div className="bg-slate-50 pb-24 dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <div className="container mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-12">
          <Breadcrumbs items={[{ label: 'Blog' }]} />
        </div>

        <header className="mb-16 max-w-3xl">
          <h1 className="mb-6 bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl dark:from-white dark:to-slate-400">
            {t('title')}
          </h1>
          <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-400">
            {t('subtitle')}
          </p>
        </header>

        {featuredPost && <FeaturedPost post={featuredPost} />}

        {remainingPosts.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {remainingPosts.map((post, index) => (
              <PostCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <div className="py-20 text-center text-slate-500">{t('noPosts')}</div>
        )}
      </div>
    </div>
  )
}
