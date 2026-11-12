import { getTranslations } from 'next-intl/server'
import type { PostSummary } from '@/features/blog/lib/blog'
import { Reveal, SECTION_X, WordReveal } from '@/shared/ui-2026'
import { FeaturedPost } from './featured-post'
import { PostRow } from './post-row'

/** Posts grouped by year, newest year first, keeping the given order inside each year. */
export function groupByYear(posts: readonly PostSummary[]): [string, PostSummary[]][] {
  const groups = new Map<string, PostSummary[]>()
  for (const post of posts) {
    const year = post.metadata.date.slice(0, 4)
    groups.set(year, [...(groups.get(year) ?? []), post])
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a))
}

export async function BlogIndex({
  posts,
  locale,
}: {
  posts: readonly PostSummary[]
  locale: string
}) {
  const t = await getTranslations('blogIndex')
  const [featured, ...rest] = posts

  return (
    <div className={`${SECTION_X} pb-24 sm:pb-32`}>
      <Reveal className="flex flex-col gap-6 pt-20 sm:pt-28">
        <p data-reveal className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
          {t('kicker')}
        </p>
        <WordReveal
          as="h1"
          text={t('title')}
          className="text-[clamp(56px,10vw,170px)] leading-[0.88] font-semibold tracking-[-0.055em] text-foreground"
        />
        <p data-reveal className="max-w-2xl text-lg leading-snug text-foreground sm:text-xl">
          {t('lead')}
        </p>
      </Reveal>

      {featured ? (
        <div className="mt-16 sm:mt-24">
          <FeaturedPost post={featured} locale={locale} label={t('latest')} />
        </div>
      ) : (
        <p className="mt-16 text-lg text-muted">{t('empty')}</p>
      )}

      {groupByYear(rest).map(([year, items]) => (
        <section key={year} aria-labelledby={`year-${year}`} className="mt-20 sm:mt-28">
          <h2
            id={`year-${year}`}
            className="font-mono text-[clamp(40px,6vw,96px)] leading-none font-semibold tracking-[-0.05em] text-muted"
          >
            {year}
          </h2>
          <ul className="mt-6 border-t border-line">
            {items.map((post) => (
              <li key={post.slug} className="border-b border-line">
                <PostRow post={post} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
