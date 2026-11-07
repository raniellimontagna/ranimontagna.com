import type { ReactNode } from 'react'
import { Link } from '@/shared/config/i18n/navigation'

type ActionLinkProps = {
  href: string
  variant?: 'solid' | 'outline' | 'quiet'
  external?: boolean
  /** A file (résumé, PDF): plain anchor, outside the locale routing. */
  download?: boolean
  className?: string
  children: ReactNode
}

const VARIANTS = {
  solid:
    'bg-accent text-on-accent hover:-translate-y-0.5 active:translate-y-0 rounded-full px-6 py-3',
  outline: 'border border-line text-foreground hover:border-foreground rounded-full px-6 py-3',
  quiet: 'text-foreground underline decoration-line underline-offset-[6px] hover:decoration-accent',
} as const

export function ActionLink({
  href,
  variant = 'solid',
  external,
  download,
  className = '',
  children,
}: ActionLinkProps) {
  const classes = `inline-flex items-center justify-center gap-2 text-sm font-semibold transition-[transform,border-color,text-decoration-color] duration-200 ${VARIANTS[variant]} ${className}`

  if (download) {
    return (
      <a href={href} download className={classes}>
        {children}
      </a>
    )
  }

  if (href.startsWith('/') && !external) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <a
      href={href}
      className={classes}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}
