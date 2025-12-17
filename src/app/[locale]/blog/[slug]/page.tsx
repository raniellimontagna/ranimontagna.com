import { getAdjacentPosts, getPostBySlug, getAllPosts } from '@/lib/blog'
import { MDXRemote } from 'next-mdx-remote/rsc'
import dayjs from 'dayjs'
import { PostNavigation, ReadingProgressBar } from '@/components/blog'
import { Breadcrumbs } from '@/components/ui'

// Generate static params for all posts in all locales
export async function generateStaticParams() {
  const locales = ['pt', 'en', 'es']
  const params: { slug: string; locale: string }[] = []

  for (const locale of locales) {
    const posts = getAllPosts(locale)
    for (const post of posts) {
      params.push({
        slug: post.slug,
        locale,
      })
    }
  }

  return params
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
  // Add more components as needed
}

export default async function PostPage(props: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const params = await props.params
  const post = getPostBySlug(params.slug, params.locale)
  const adjacentPosts = getAdjacentPosts(params.slug, params.locale)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <ReadingProgressBar />
      <article className="container mx-auto max-w-3xl px-4 py-24">
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: 'Blog', href: `/${params.locale}/blog` },
              { label: post.metadata.title },
            ]}
          />
        </div>

        <header className="mb-12">
          <div className="mb-4 flex items-center gap-4">
            <time className="text-sm text-slate-500 dark:text-slate-400">
              {dayjs(post.metadata.date).format('MMMM DD, YYYY')}
            </time>
            <div className="flex gap-2">
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
        </header>

        <div className="prose prose-slate mt-12 mb-20 max-w-none dark:prose-invert">
          <MDXRemote source={post.content} components={components} />
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
