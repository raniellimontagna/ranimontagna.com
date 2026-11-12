import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { createArticleComponents } from '@/features/blog/components/article-body'
import { ArticleHeader } from '@/features/blog/components/article-header'
import { PostNav } from '@/features/blog/components/post-nav'
import { ReadingProgress } from '@/features/blog/components/reading-progress'
import { getAdjacentPosts, getAllPosts, getPostBySlug } from '@/features/blog/lib/blog'
import { remarkBlogContentPolicy } from '@/features/blog/lib/blog-content-policy'
import { resolveBlogImageUrl, resolveBlogMediaUrl } from '@/features/blog/lib/media'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'
import { generateBlogPostingJsonLd, serializeJsonLd } from '@/shared/lib/jsonld'

function getPostUrl(locale: string, slug: string): string {
  const isDefault = locale === routing.defaultLocale
  return isDefault ? `${BASE_URL}/blog/${slug}` : `${BASE_URL}/${locale}/blog/${slug}`
}

function getBlogUrl(locale: string): string {
  const isDefault = locale === routing.defaultLocale
  return isDefault ? `${BASE_URL}/blog` : `${BASE_URL}/${locale}/blog`
}

// Generate static params for all posts in all locales
export async function generateStaticParams() {
  const locales = ['pt', 'en', 'es']
  const params: { slug: string; locale: string }[] = []

  for (const locale of locales) {
    const posts = await getAllPosts(locale)
    for (const post of posts) {
      params.push({
        slug: post.slug,
        locale,
      })
    }
  }

  return params
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug, locale)

  if (!post) {
    return { title: 'Post not found' }
  }

  const url = getPostUrl(locale, slug)
  const ogImage = resolveBlogImageUrl(post.metadata.coverImage)

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    keywords: post.metadata.tags
      ? `${post.metadata.tags.join(', ')}, Ranielli Montagna, Ranielli`
      : 'Ranielli Montagna',
    authors: [{ name: 'Ranielli Montagna', url: BASE_URL }],
    creator: 'Ranielli Montagna',
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      url,
      siteName: 'Ranielli Montagna',
      locale: locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'article',
      publishedTime: post.metadata.date,
      authors: ['Ranielli Montagna'],
      tags: post.metadata.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metadata.title,
      description: post.metadata.description,
      creator: '@rannimontagna',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function PostPage(props: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const params = await props.params
  const post = await getPostBySlug(params.slug, params.locale)

  if (!post) {
    notFound()
  }

  const adjacentPosts = await getAdjacentPosts(params.slug, params.locale)
  const t = await getTranslations({ locale: params.locale, namespace: 'blog' })
  const coverImage = resolveBlogMediaUrl(post.metadata.coverImage)
  const jsonLd = generateBlogPostingJsonLd({
    url: getPostUrl(params.locale, params.slug),
    blogUrl: getBlogUrl(params.locale),
    locale: params.locale,
    title: post.metadata.title,
    description: post.metadata.description,
    date: post.metadata.date,
    image: resolveBlogImageUrl(post.metadata.coverImage),
    tags: post.metadata.tags ?? [],
  })

  const tIndex = await getTranslations({ locale: params.locale, namespace: 'blogIndex' })
  const components = createArticleComponents({ zoom: t('zoomIn'), close: tIndex('closeImage') })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ReadingProgress />
      <article className="px-4 pb-24 sm:px-8 sm:pb-32 lg:px-12">
        <ArticleHeader
          post={post}
          locale={params.locale}
          cover={coverImage}
          backLabel={t('backToBlog')}
        />
        <div className="article-2026 mx-auto mt-14 max-w-[68ch] sm:mt-20">
          <MDXRemote
            source={post.content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkBlogContentPolicy],
              },
            }}
          />
        </div>
        <div className="mx-auto max-w-[68ch]">
          <PostNav
            labels={{ previous: t('previous'), next: t('next'), back: t('backToBlog') }}
            prev={
              adjacentPosts.prev
                ? { slug: adjacentPosts.prev.slug, title: adjacentPosts.prev.metadata.title }
                : undefined
            }
            next={
              adjacentPosts.next
                ? { slug: adjacentPosts.next.slug, title: adjacentPosts.next.metadata.title }
                : undefined
            }
          />
        </div>
      </article>
    </>
  )
}
