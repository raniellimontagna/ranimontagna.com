import { getTranslations } from 'next-intl/server'
import { FeaturedPost, PostCard } from '@/components/blog'
import { Breadcrumbs } from '@/components/ui'
import { getAllPosts } from '@/lib/blog'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('blog')

  const baseUrl = 'https://ranimontagna.com'
  const url = `${baseUrl}/${locale}/blog`

  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url,
      siteName: 'Ranielli Montagna',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('subtitle'),
      creator: '@raniellimontagna',
    },
    alternates: {
      canonical: url,
      languages: {
        pt: `${baseUrl}/pt/blog`,
        en: `${baseUrl}/en/blog`,
        es: `${baseUrl}/es/blog`,
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

  return (
    <div className="bg-slate-50 pb-24 dark:bg-slate-950">
      <div className="container mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-12">
          <Breadcrumbs items={[{ label: 'Blog' }]} />
        </div>

        <header className="mb-16 max-w-3xl">
          <h1 className="mb-6 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl dark:from-white dark:to-slate-400">
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
