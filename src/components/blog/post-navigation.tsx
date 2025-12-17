import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

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
    <nav className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:justify-between dark:border-slate-800">
      {prevPost ? (
        <Link
          href={`/blog/${prevPost.slug}`}
          className="group flex flex-1 items-start gap-3 rounded-lg border border-transparent p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="mt-1 h-5 w-5 text-slate-400 transition-colors group-hover:text-purple-600 dark:text-slate-500 dark:group-hover:text-purple-400" />
          <div>
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Previous
            </div>
            <div className="font-medium text-slate-900 group-hover:text-purple-600 dark:text-slate-100 dark:group-hover:text-purple-400">
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
          className="group flex flex-1 items-start justify-end gap-3 rounded-lg border border-transparent p-4 text-right transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <div>
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Next
            </div>
            <div className="font-medium text-slate-900 group-hover:text-purple-600 dark:text-slate-100 dark:group-hover:text-purple-400">
              {nextPost.title}
            </div>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 text-slate-400 transition-colors group-hover:text-purple-600 dark:text-slate-500 dark:group-hover:text-purple-400" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  )
}
