import dayjs from 'dayjs'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { PostNavigation, ReadingProgressBar, ScrollToTop } from '@/components/blog'
import { Breadcrumbs } from '@/components/ui'
import { getAdjacentPosts, getAllPosts, getPostBySlug } from '@/lib/blog'
import { BASE_URL } from '@/lib/constants'

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

  const url = `${BASE_URL}/${locale}/blog/${slug}`

  // Fallback image when no coverImage is set
  const defaultOgImage =
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop&q=80'
  const ogImage = post.metadata.coverImage || defaultOgImage

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    keywords: post.metadata.tags?.join(', '),
    authors: [{ name: 'Ranielli Montagna' }],
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      url,
      siteName: 'Ranielli Montagna',
      locale,
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
      creator: '@raniellimontagna',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        pt: `${BASE_URL}/pt/blog/${slug}`,
        en: `${BASE_URL}/en/blog/${slug}`,
        es: `${BASE_URL}/es/blog/${slug}`,
      },
    },
  }
}

// Components mapping for MDX
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      {...props}
      className="mb-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="mb-4 mt-8 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="mb-3 mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="mb-6 leading-relaxed text-slate-700 dark:text-slate-300" />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="mb-6 list-disc pl-6 text-slate-700 dark:text-slate-300" />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="mb-6 list-decimal pl-6 text-slate-700 dark:text-slate-300" />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="mb-2 text-slate-700 dark:text-slate-300" />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className="mb-6 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 text-sm text-slate-100 dark:border-slate-800 dark:bg-slate-950"
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    // Check if it's inline code (no className with language-)
    const isInline = !props.className?.includes('language-')
    if (isInline) {
      return (
        <code
          {...props}
          className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
        />
      )
    }
    return <code {...props} />
  },
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 transition-colors hover:text-blue-700 hover:decoration-blue-700/50 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:text-blue-300 dark:hover:decoration-blue-300/50 wrap-break-word [word-break:break-word]"
      target={props.href?.startsWith('http') ? '_blank' : undefined}
      rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <figure className="my-8">
      {/* biome-ignore lint/a11y/useAltText: alt is passed from MDX via props spread */}
      {/* biome-ignore lint/performance/noImgElement: next/image cannot be used with MDX dynamic props */}
      <img
        {...props}
        className="w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-800"
        loading="lazy"
      />
      {props.alt && (
        <figcaption className="mt-3 text-center text-sm italic text-slate-500 dark:text-slate-400">
          {props.alt}
        </figcaption>
      )}
    </figure>
  ),
}

export default async function PostPage(props: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const params = await props.params
  const post = await getPostBySlug(params.slug, params.locale)
  const adjacentPosts = await getAdjacentPosts(params.slug, params.locale)

  const url = `${BASE_URL}/${params.locale}/blog/${params.slug}`

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metadata.title,
    description: post.metadata.description,
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
    },
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.metadata.tags?.join(', '),
    articleSection: 'Technology',
    inLanguage: params.locale,
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-slate-950">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgressBar />
      <ScrollToTop />
      <article className="container mx-auto max-w-3xl overflow-x-hidden px-4 py-24">
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: 'Blog', href: `/${params.locale}/blog` },
              { label: post.metadata.title },
            ]}
          />
        </div>

        <header className="mb-12">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <time className="text-sm text-slate-500 dark:text-slate-400">
              {dayjs(post.metadata.date).format('MMMM DD, YYYY')}
            </time>
            <div className="flex flex-wrap gap-2">
              {post.metadata.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {post.metadata.title}
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
            {post.metadata.description}
          </p>
          {post.metadata.coverImage && (
            <div className="mt-8 -mx-4 sm:mx-0 sm:rounded-2xl overflow-hidden">
              <div className="relative aspect-21/9 sm:aspect-2/1 w-full">
                {/* biome-ignore lint/performance/noImgElement: external URL requires unoptimized img */}
                <img
                  src={post.metadata.coverImage}
                  alt={post.metadata.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-white/20 to-transparent dark:from-slate-950/30" />
              </div>
            </div>
          )}
        </header>

        <div className="prose prose-slate mt-12 mb-20 max-w-none overflow-x-hidden dark:prose-invert">
          <MDXRemote
            source={post.content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>

        <PostNavigation
          prevPost={
            adjacentPosts.prev
              ? {
                  slug: adjacentPosts.prev.slug,
                  title: adjacentPosts.prev.metadata.title,
                }
              : undefined
          }
          nextPost={
            adjacentPosts.next
              ? {
                  slug: adjacentPosts.next.slug,
                  title: adjacentPosts.next.metadata.title,
                }
              : undefined
          }
        />
      </article>
    </div>
  )
}
