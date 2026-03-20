import { getTranslations, setRequestLocale } from 'next-intl/server'
import { FeaturedPost, PostCard } from '@/features/blog/components'
import { getAllPosts } from '@/features/blog/lib/blog'
import { FadeIn, RevealText } from '@/shared/components/animations'
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
    <div className="relative min-h-screen bg-background pb-14 sm:pb-20 lg:pb-24">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 atmospheric-grid opacity-30" />
      <div className="absolute top-0 right-1/4 -z-10 h-112 w-md rounded-full bg-accent-ice/10 blur-[120px]" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <div className="container mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12 lg:pt-16">
        <div className="mb-8 sm:mb-12">
          <Breadcrumbs items={[{ label: 'Blog' }]} />
        </div>

        <header className="mb-10 max-w-3xl sm:mb-14 lg:mb-16">
          <h1 className="mb-4 font-heading text-3xl font-semibold tracking-[-0.05em] text-foreground sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            <RevealText text={t('title')} />
          </h1>
          <FadeIn delay={0.3} blur>
            <p className="text-base leading-relaxed text-muted sm:text-lg lg:text-xl">
              {t('subtitle')}
            </p>
          </FadeIn>
        </header>

        {featuredPost && <FeaturedPost post={featuredPost} />}

        {remainingPosts.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
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
