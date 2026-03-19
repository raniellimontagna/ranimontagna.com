import { ArrowRight, CheckCircle, StarFall } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/shared/lib/utils'

interface ServiceCardProps {
  title: string
  description: string
  features: string[]
  icon: ComponentType<SVGProps<SVGSVGElement>>
  eyebrow?: string
  className?: string
  popular?: boolean
}

export function ServiceCard({
  title,
  description,
  features,
  icon: Icon,
  eyebrow,
  className,
  popular,
}: ServiceCardProps) {
  const t = useTranslations('services')

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface/94 p-6 shadow-card transition-all duration-500 backdrop-blur-sm sm:p-7',
        'hover:-translate-y-1 hover:border-foreground/12 hover:shadow-2xl',
        popular && 'border-accent/35',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,202,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(162,255,61,0.16),transparent_34%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
              {eyebrow}
            </p>
          )}

          <div className="relative mt-4 inline-flex">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-line bg-surface-strong text-foreground transition-all duration-300',
                'group-hover:scale-105 group-hover:bg-foreground group-hover:text-background',
              )}
            >
              <Icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="absolute -inset-2 -z-10 rounded-3xl bg-[radial-gradient(circle,rgba(111,202,255,0.2),transparent_58%)] opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        </div>

        {popular && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent/12 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-800 dark:text-lime-300">
            <StarFall className="h-3 w-3" />
            {t('popularBadge')}
          </div>
        )}
      </div>

      <div className="relative flex-1">
        <h3 className="mt-8 text-2xl font-semibold tracking-[-0.05em] text-foreground">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-muted">{description}</p>

        <ul className="mt-7 space-y-3.5">
          {features.map((feature, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 text-sm text-foreground"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <CheckCircle className="h-3 w-3" />
              </span>
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-8 pt-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-line to-transparent" />
        <a
          href="#contact"
          className={cn(
            'group/btn flex w-full items-center justify-between gap-2 rounded-full border border-line bg-surface-strong px-4 py-3 text-sm font-semibold text-foreground transition-all duration-300',
            'hover:border-foreground/24 hover:bg-foreground hover:text-background',
            popular && 'border-accent/35 bg-accent/12',
          )}
        >
          {t('getStarted')}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </a>
      </div>
    </div>
  )
}
