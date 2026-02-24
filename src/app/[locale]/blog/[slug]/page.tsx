import dayjs from 'dayjs'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import {
  ImageWithLightbox,
  MermaidDiagram,
  PostNavigation,
  ReadingProgressBar,
  ScrollToTop,
} from '@/features/blog/components'
import { getAdjacentPosts, getAllPosts, getPostBySlug } from '@/features/blog/lib/blog'
import { Breadcrumbs } from '@/shared/components/ui'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'

function getPostUrl(locale: string, slug: string): string {
  const isDefault = locale === routing.defaultLocale
  return isDefault ? `${BASE_URL}/blog/${slug}` : `${BASE_URL}/${locale}/blog/${slug}`
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

  const url = getPostUrl(locale, slug)

  // Fallback image when no coverImage is set
  const defaultOgImage =
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop&q=80'
  const ogImage = post.metadata.coverImage || defaultOgImage

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
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    // Check if this is a mermaid code block
    const children = props.children as React.ReactElement
    const className = (children?.props as { className?: string })?.className || ''
    const code = (children?.props as { children?: string })?.children || ''

    if (className.includes('language-mermaid')) {
      return <MermaidDiagram chart={String(code).trim()} />
    }

    // Regular code block
    return (
      <pre
        {...props}
        className="mb-6 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 text-sm text-slate-100 dark:border-slate-800 dark:bg-slate-950"
      />
    )
  },
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
    <ImageWithLightbox src={props.src?.toString()} alt={props.alt} />
  ),
  // Table components with modern styling
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table
        {...props}
        className="w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700"
      />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props} className="bg-slate-50 dark:bg-slate-800/50" />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody
      {...props}
      className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900"
    />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr {...props} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50" />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      {...props}
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300" />
  ),
}

export default async function PostPage(props: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const params = await props.params
  const post = await getPostBySlug(params.slug, params.locale)
  const adjacentPosts = await getAdjacentPosts(params.slug, params.locale)

  const url = getPostUrl(params.locale, params.slug)

  // JSON-LD structured data for SEO
  const postOgImage =
    post.metadata.coverImage ||
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop&q=80'

  // Estimate word count from markdown content (strip MDX/markdown syntax)
  const wordCount = post.content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`[\]()>_~]/g, '')
    .split(/\s+/)
    .filter(Boolean).length

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#blogposting`,
    headline: post.metadata.title,
    description: post.metadata.description,
    image: {
      '@type': 'ImageObject',
      url: postOgImage,
      width: 1200,
      height: 630,
    },
    datePublished: post.metadata.date,
    dateModified: post.metadata.date,
    wordCount,
    author: {
      '@type': 'Person',
      name: 'Ranielli Montagna',
      url: BASE_URL,
      '@id': `${BASE_URL}/#person`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ranielli Montagna',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo/white.svg`,
      },
    },
    url,
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
    inLanguage: params.locale,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.prose p:first-of-type'],
    },
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
