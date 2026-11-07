import type { PostSummary } from '@/features/blog/lib/blog'
import { formatBlogDate } from '@/features/blog/lib/blog-date'
import { Link } from '@/shared/config/i18n/navigation'
import { Reveal, WordReveal } from '@/shared/ui-2026'
import { SafeImage } from './safe-image'

type ArticleHeaderProps = { post: PostSummary; locale: string; cover?: string; backLabel: string }

export function ArticleHeader({ post, locale, cover, backLabel }: ArticleHeaderProps) {
  return (
    <header className="pt-24 sm:pt-32">
      <Reveal className="mx-auto flex max-w-5xl flex-col gap-6">
        <Link
          href="/blog"
          data-reveal
          className="self-start font-mono text-xs tracking-[0.2em] text-muted uppercase hover:text-foreground"
        >
          ← {backLabel}
        </Link>
        <p
          data-reveal
          className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted"
        >
          <time dateTime={post.metadata.date}>{formatBlogDate(post.metadata.date, locale)}</time>
          {post.metadata.tags?.map((tag) => (
            <span key={tag} className="text-accent">
              #{tag}
            </span>
          ))}
        </p>
        <WordReveal
          as="h1"
          text={post.metadata.title}
          className="text-[clamp(40px,6.4vw,104px)] leading-[0.95] font-semibold tracking-[-0.045em] text-foreground"
        />
        <p data-reveal className="max-w-3xl text-xl leading-snug text-foreground sm:text-2xl">
          {post.metadata.description}
        </p>
      </Reveal>
      {cover ? (
        <div className="relative mx-auto mt-14 aspect-[2/1] max-w-6xl overflow-hidden border border-line">
          <SafeImage
            src={cover}
            alt={post.metadata.title}
            fill
            preload
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
        </div>
      ) : null}
    </header>
  )
}
