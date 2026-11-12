import { Link } from '@/shared/config/i18n/navigation'

type NavPost = { slug: string; title: string }
type PostNavProps = {
  prev?: NavPost
  next?: NavPost
  labels: { previous: string; next: string; back: string }
}

export function PostNav({ prev, next, labels }: PostNavProps) {
  return (
    <nav className="mt-20 flex flex-col gap-10 border-t border-line pt-12">
      <div className="grid gap-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/blog/${prev.slug}`} className="group flex flex-col gap-2">
            <span className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
              ← {labels.previous}
            </span>
            <span className="text-xl font-semibold tracking-tight text-foreground group-hover:text-accent">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group flex flex-col gap-2 sm:items-end sm:text-right"
          >
            <span className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
              {labels.next} →
            </span>
            <span className="text-xl font-semibold tracking-tight text-foreground group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        ) : null}
      </div>
      <Link
        href="/blog"
        className="self-start text-sm font-semibold text-foreground underline decoration-line underline-offset-[6px] hover:decoration-accent"
      >
        {labels.back}
      </Link>
    </nav>
  )
}
