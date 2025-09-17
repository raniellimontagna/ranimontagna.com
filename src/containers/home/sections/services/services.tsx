'use client'

import { useTranslations } from 'next-intl'
import { Check, ArrowRight, Star } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'

import type { ServiceCardProps, ServiceType } from './services.types'
import { servicesData } from './services.static'

function ServiceCard({ service, animationDelay }: ServiceCardProps) {
  const t = useTranslations('services')
  const Icon = service.icon

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
        service.popular
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:border-blue-400 dark:from-blue-950/50 dark:to-purple-950/50'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
      }`}
      style={{ animationDelay }}
    >
      {service.popular && (
        <div className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-medium text-white">
          <Star className="mr-2 h-4 w-4 fill-current" />
          {t('popularBadge')}
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="mb-6 flex items-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 ${
              service.popular
                ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            <Icon className="h-7 w-7" />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="mb-3 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
            {service.title}
          </h3>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            {service.description}
          </p>
        </div>

        <div className="mb-6 flex-1">
          <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">
            {t('includedTitle')}
          </h4>
          <ul className="space-y-2">
            {service.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start text-sm text-slate-600 dark:text-slate-300"
              >
                <Check className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          <button
            className={`group flex w-full items-center justify-center rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-105 ${
              service.popular
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-slate-500 text-white hover:bg-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-950'
            }`}
            onClick={() => {
              const contactSection = document.getElementById('contact')
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            {t('ctaButton')}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

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
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-32 dark:bg-slate-900"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 left-32 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-700/20"></div>
        <div className="absolute right-32 bottom-32 h-80 w-80 rounded-full bg-purple-300/10 blur-3xl dark:bg-purple-600/10"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Star className="mr-2 h-4 w-4" />
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-6xl dark:text-slate-100">
              {t('title.part1')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('title.part2')}
              </span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mx-auto max-w-3xl text-lg text-slate-600 sm:text-xl dark:text-slate-300">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <StaggerContainer staggerDelay={0.1}>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <StaggerItem key={service.id}>
                <ServiceCard service={service} animationDelay="0ms" />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <FadeIn delay={1.2}>
          <div className="mt-16 lg:mt-20">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8 text-center shadow-xl lg:p-12 dark:from-slate-800 dark:via-blue-900/20 dark:to-purple-900/20">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-400/20 blur-3xl"></div>

              <div className="relative z-10">
                <h3 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
                  {t('cta.title')}
                </h3>

                <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                  {t('cta.subtitle')}
                </p>

                <button
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  onClick={() => {
                    const contactSection = document.getElementById('contact')
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  {t('cta.button')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
