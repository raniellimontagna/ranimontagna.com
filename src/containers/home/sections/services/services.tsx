'use client'

import { ArrowRight, StarFall } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { ServiceCard } from '@/components/ui/service-card'

import { servicesData } from './services.static'
import type { ServiceType } from './services.types'

export function Services() {
  const t = useTranslations('services')

  const services: ServiceType[] = servicesData.map((s) => ({
    ...s,
    title: t(`list.${s.id}.title`),
    description: t(`list.${s.id}.description`),
    features: t.raw(`list.${s.id}.features`) as string[],
  }))

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-28 lg:py-36 dark:bg-slate-950"
    >
      {/* Background patterns */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/10" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(51,65,85,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.3)_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center lg:mb-20">
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-300">
              <StarFall className="h-4 w-4" />
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 font-mono text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl xl:text-6xl dark:text-slate-100">
              {t('title.part1')}{' '}
              <span className="bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
                {t('title.part2')}
              </span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg lg:text-xl dark:text-slate-400">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        {/* Service Cards Grid */}
        <StaggerContainer staggerDelay={0.1}>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <StaggerItem key={service.id}>
                <ServiceCard
                  title={service.title}
                  description={service.description}
                  features={service.features}
                  icon={service.icon}
                  popular={service.popular}
                />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* CTA Section */}
        <FadeIn delay={1.2}>
          <div className="mt-20 lg:mt-28">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-8 shadow-xl sm:p-10 lg:p-14 dark:border-slate-800/60 dark:bg-slate-900/80">
              {/* CTA Background gradient */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-blue-50 via-transparent to-purple-50 dark:from-blue-900/20 dark:via-transparent dark:to-purple-900/20" />

              <div className="relative z-10 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-300">
                  <StarFall className="h-3 w-3" />
                  {t('cta.badge')}
                </div>

                <h3 className="mb-4 font-mono text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
                  {t('cta.title')}
                </h3>

                <p className="mx-auto mb-8 max-w-xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
                  {t('cta.subtitle')}
                </p>

                <button
                  type="button"
                  className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:from-blue-500 hover:to-blue-400 hover:shadow-xl hover:shadow-blue-500/40"
                  onClick={() => {
                    const contactSection = document.getElementById('contact')
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  {t('cta.button')}
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
