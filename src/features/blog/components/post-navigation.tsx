import { ArrowLeft, ArrowRight } from '@solar-icons/react/ssr'
import { Link } from '@/shared/config/i18n/navigation'

interface PostLink {
  slug: string
  title: string
}

interface PostNavigationProps {
  prevPost?: PostLink
  nextPost?: PostLink
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  return (
    <nav className="mt-12 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:justify-between">
      {prevPost ? (
        <Link
          href={`/blog/${prevPost.slug}`}
          className="group flex flex-1 items-start gap-3 rounded-2xl border border-transparent p-4 transition-all hover:border-line hover:bg-surface"
        >
          <ArrowLeft className="mt-1 h-5 w-5 text-muted transition-colors group-hover:text-foreground" />
          <div>
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
              Previous
            </div>
            <div className="font-medium text-foreground group-hover:text-foreground/80">
              {prevPost.title}
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {nextPost ? (
        <Link
          href={`/blog/${nextPost.slug}`}
          className="group flex flex-1 items-start justify-end gap-3 rounded-2xl border border-transparent p-4 text-right transition-all hover:border-line hover:bg-surface"
        >
          <div>
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">Next</div>
            <div className="font-medium text-foreground group-hover:text-foreground/80">
              {nextPost.title}
            </div>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 text-muted transition-colors group-hover:text-foreground" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  )
}
