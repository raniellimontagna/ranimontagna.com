import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900',
        popular && 'ring-2 ring-blue-500 dark:ring-blue-400',
        className,
      )}
    >
      {popular && (
        <div className="absolute top-0 right-0 rounded-bl-xl bg-blue-500 px-3 py-1 text-xs font-bold text-white dark:bg-blue-600">
          {t('popularBadge')}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-900 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:bg-gray-800 dark:text-white dark:group-hover:bg-blue-500">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>

      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{description}</p>

      <ul className="mb-6 flex-1 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
            <Check className="mr-2 h-5 w-5 shrink-0 text-blue-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-gray-100 pt-6 dark:border-gray-800">
        <button
          type="button"
          className="w-full flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          onClick={() => {
            const contactSection = document.getElementById('contact')
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          {t('getStarted')}
        </button>
      </div>
    </div>
  )
}
