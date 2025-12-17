'use client'

import { ArrowRight, Star } from 'lucide-react'
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
      className="relative overflow-hidden bg-gray-50 py-16 sm:py-20 lg:py-32 dark:bg-gray-950"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Star className="mr-2 h-4 w-4" />
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-6xl dark:text-gray-100 font-mono">
              {t('title.part1')}{' '}
              <span className="text-blue-600 dark:text-blue-500">{t('title.part2')}</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl dark:text-gray-400">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <StaggerContainer staggerDelay={0.1}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
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

        <FadeIn delay={1.2}>
          <div className="mt-16 lg:mt-20">
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg lg:p-12 dark:border-gray-800 dark:bg-gray-900">
              <div className="relative z-10">
                <h3 className="mb-4 text-2xl font-bold font-mono text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
                  {t('cta.title')}
                </h3>

                <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                  {t('cta.subtitle')}
                </p>

                <button
                  type="button"
                  className="inline-flex items-center rounded bg-blue-600 px-8 py-4 font-mono font-medium text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl dark:bg-blue-700 dark:hover:bg-blue-600"
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
