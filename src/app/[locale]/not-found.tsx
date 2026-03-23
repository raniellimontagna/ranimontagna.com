'use client'

import { ArrowRight, Document, Home, Letter, Suitcase, User } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import { StaggerContainer, StaggerItem } from '@/shared/components/animations'
import { ErrorContent } from '@/shared/components/ui/error-view'
import { Link } from '@/shared/config/i18n/navigation'

export default function NotFoundPage() {
  const t = useTranslations('notFound')

  const suggestionLinks = [
    { key: 'about', href: '/#about', icon: User },
    { key: 'projects', href: '/#projects', icon: Suitcase },
    { key: 'blog', href: '/blog', icon: Document },
    { key: 'contact', href: '/#contact', icon: Letter },
  ]

  return (
    <ErrorContent
      code="404"
      title={t('title')}
      description={t('description')}
      variant="accent"
      footer={
        <StaggerContainer className="space-y-6">
          <StaggerItem>
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted/60">
                {t('suggestions')}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 px-2">
              {suggestionLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="group surface-panel hover:surface-panel-strong relative flex flex-col items-center rounded-2xl border border-line p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-strong text-accent-strong ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-110">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <span className="mb-0.5 text-sm font-bold text-foreground line-clamp-1">
                    {t(`links.${link.key}.title`)}
                  </span>
                  <p className="mb-2 text-[10px] text-muted leading-tight line-clamp-2">
                    {t(`links.${link.key}.description`)}
                  </p>
                  <span className="inline-flex items-center text-[8px] font-bold uppercase tracking-widest text-accent-strong transition-opacity group-hover:opacity-100 opacity-60">
                    {t('visitSection')}
                    <ArrowRight className="ml-1 h-2 w-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </StaggerItem>
        </StaggerContainer>
      }
    >
      <Link
        href="/"
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-foreground px-10 py-4 font-semibold text-background transition-all hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
      >
        <Home className="h-5 w-5 shrink-0" />
        <span className="whitespace-nowrap">{t('backHome')}</span>
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </Link>
    </ErrorContent>
  )
}
