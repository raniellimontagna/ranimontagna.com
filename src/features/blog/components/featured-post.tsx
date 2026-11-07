import type { PostSummary } from '@/features/blog/lib/blog'
import { formatBlogDate } from '@/features/blog/lib/blog-date'
import { resolveBlogImageUrl } from '@/features/blog/lib/media'
import { Link } from '@/shared/config/i18n/navigation'
import { PhotoReveal } from '@/shared/ui-2026'

export function FeaturedPost({
  post,
  locale,
  label,
}: {
  post: PostSummary
  locale: string
  label: string
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-14"
    >
      <PhotoReveal
        src={resolveBlogImageUrl(post.metadata.coverImage)}
        alt=""
        effect="scale"
        sizes="(max-width: 1023px) 100vw, 60vw"
        priority
        className="aspect-[16/10] w-full border border-line"
      />
      <span className="flex flex-col gap-4">
        <span className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{label}</span>
        <span className="text-[clamp(32px,3.8vw,60px)] leading-[1] font-semibold tracking-[-0.03em] text-foreground">
          {post.metadata.title}
        </span>
        <span className="text-lg leading-snug text-foreground">{post.metadata.description}</span>
        <span className="font-mono text-xs text-muted">
          {formatBlogDate(post.metadata.date, locale)}
        </span>
      </span>
    </Link>
  )
}
