import type { PostSummary } from '@/features/blog/lib/blog'
import { formatBlogDate } from '@/features/blog/lib/blog-date'
import { resolveBlogImageUrl } from '@/features/blog/lib/media'
import { Link } from '@/shared/config/i18n/navigation'

export function PostRow({ post, locale }: { post: PostSummary; locale: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-4 py-8 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-8"
    >
      {/* biome-ignore lint/performance/noImgElement: remote blog cover, decorative thumbnail. */}
      <img
        src={resolveBlogImageUrl(post.metadata.coverImage)}
        alt=""
        loading="lazy"
        className="aspect-[16/10] w-full rounded-[2px] object-cover sm:w-40"
      />
      <span className="flex flex-col gap-2">
        <span className="text-2xl leading-tight font-semibold tracking-tight text-foreground transition-transform duration-300 group-hover:translate-x-1.5 sm:text-3xl">
          {post.metadata.title}
        </span>
        <span className="max-w-2xl text-base text-foreground">{post.metadata.description}</span>
      </span>
      <span className="font-mono text-xs text-muted">
        {formatBlogDate(post.metadata.date, locale)}
      </span>
    </Link>
  )
}
