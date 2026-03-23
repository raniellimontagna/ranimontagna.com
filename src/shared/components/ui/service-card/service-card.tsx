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
        'group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface/94 p-4 shadow-card transition-all duration-500 backdrop-blur-sm sm:rounded-4xl sm:p-6 lg:p-7',
        'hover:-translate-y-1 hover:border-foreground/12 hover:shadow-2xl',
        popular && 'border-accent/35',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 glow-gradient opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
              {eyebrow}
            </p>
          )}

          <div className="relative mt-4 inline-flex">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-3xl border border-line bg-surface-strong text-foreground transition-all duration-300',
                'group-hover:scale-105 group-hover:bg-foreground group-hover:text-background',
              )}
            >
              <Icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="absolute -inset-2 -z-10 rounded-3xl bg-[radial-gradient(circle,var(--glow-ice-strong),transparent_58%)] opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        </div>

        {popular && (
          <div className="inline-flex h-fit self-start items-center gap-1.5 rounded-full border border-accent/35 bg-accent/12 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-strong dark:text-accent-ice sm:h-fit">
            <StarFall className="h-3 w-3" />
            {t('popularBadge')}
          </div>
        )}
      </div>

      <div className="relative flex-1 min-w-0">
        <h3 className="mt-8 text-balance text-2xl font-semibold tracking-[-0.05em] text-foreground">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-muted">{description}</p>

        <div className="mt-7 rounded-2xl border border-line/60 bg-canvas/50 p-1">
          <ul className="flex flex-col">
            {features.map((feature, i) => (
              <li
                key={i}
                className={cn(
                  'flex min-w-0 items-center gap-3 px-3.5 py-2.5 text-sm text-foreground',
                  i !== features.length - 1 && 'border-b border-line/40',
                )}
              >
                <CheckCircle className="h-4 w-4 shrink-0 text-accent dark:text-accent-ice" />
                <span className="min-w-0 leading-snug wrap-break-word">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative mt-8 pt-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-line to-transparent" />
        <a
          href="#contact"
          className={cn(
            'group/btn flex w-full items-center justify-between gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition-all duration-300',
            popular
              ? 'bg-accent text-white hover:bg-accent-strong dark:bg-accent-ice dark:text-background dark:hover:bg-accent-ice/85'
              : 'border border-line bg-surface-strong text-foreground hover:border-foreground/24 hover:bg-foreground hover:text-background',
          )}
        >
          {t('getStarted')}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </a>
      </div>
    </div>
  )
}
