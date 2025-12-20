import type { LucideIcon } from 'lucide-react'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  title: string
  description: string
  features: string[]
  icon: LucideIcon
  className?: string
  popular?: boolean
}

export function ServiceCard({
  title,
  description,
  features,
  icon: Icon,
  className,
  popular,
}: ServiceCardProps) {
  const t = useTranslations('services')

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col rounded-2xl border border-slate-200/60 bg-white p-6 transition-all duration-500 dark:border-slate-800/60 dark:bg-slate-900/80',
        'hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:border-slate-700 dark:hover:shadow-slate-900/50',
        'hover:-translate-y-1',
        popular && 'border-blue-200 dark:border-blue-900/50',
        className,
      )}
    >
      {/* Background gradient on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-blue-50/0 via-transparent to-purple-50/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-blue-900/0 dark:to-purple-900/0 dark:group-hover:from-blue-900/20 dark:group-hover:to-purple-900/10" />

      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-3 right-6 z-10">
          <div className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-blue-600 to-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="h-3 w-3" />
            {t('popularBadge')}
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="relative mb-6">
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300',
            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
            'group-hover:bg-linear-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30',
          )}
        >
          <Icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
        </div>
        {/* Glow effect */}
        <div className="absolute -inset-1 -z-10 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="relative flex-1">
        <h3 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
          {title}
        </h3>

        <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>

        {/* Features list */}
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <div className="relative mt-8 pt-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
        <button
          type="button"
          className={cn(
            'group/btn flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300',
            'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
            'hover:shadow-lg hover:shadow-slate-900/20 dark:hover:shadow-white/10',
            popular &&
              'bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 dark:from-blue-600 dark:to-blue-500',
          )}
          onClick={() => {
            const contactSection = document.getElementById('contact')
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          {t('getStarted')}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  )
}
