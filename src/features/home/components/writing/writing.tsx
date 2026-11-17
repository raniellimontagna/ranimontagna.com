import { getTranslations } from 'next-intl/server'
import { getAllPosts, type PostSummary } from '@/features/blog/lib/blog'
import { formatBlogDate } from '@/features/blog/lib/blog-date'
import { resolveBlogImageUrl } from '@/features/blog/lib/media'
import { ActionLink, Reveal, SECTION_X, SectionHeading } from '@/shared/ui-2026'
import { WritingList } from './writing-list'

const LATEST = 4

/** The latest posts. When the blog cannot be reached, the section steps aside. */
export async function Writing({ locale }: { locale: string }) {
  let posts: PostSummary[]
  try {
    posts = await getAllPosts(locale)
  } catch {
    return null
  }
  if (!posts.length) return null

  const t = await getTranslations('writing')
  const latest = posts.slice(0, LATEST).map((post) => ({
    slug: post.slug,
    title: post.metadata.title,
    date: formatBlogDate(post.metadata.date, locale),
    image: resolveBlogImageUrl(post.metadata.coverImage),
  }))

  return (
    <section id="escrita" className={`${SECTION_X} bg-background py-24 sm:py-32`}>
      <Reveal className="flex flex-col gap-12">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading id="escrita" kicker={t('kicker')} title={t('title')} lead={t('lead')} />
          <ActionLink href="/blog" variant="outline" className="self-start lg:self-auto">
            {t('all')}
          </ActionLink>
        </div>
        <WritingList posts={latest} />
      </Reveal>
    </section>
  )
}
