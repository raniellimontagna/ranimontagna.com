import { ArrowRight, StarFall } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import {
  FadeIn,
  MagneticHover,
  RevealText,
  StaggerContainer,
  StaggerItem,
} from '@/shared/components/animations'
import { ServiceCard } from '@/shared/components/ui'

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
  const serviceLayouts: Record<string, string> = {
    'web-development': 'lg:col-span-4',
    'api-development': 'lg:col-span-2',
    'ai-integration': 'lg:col-span-2',
    'mobile-development': 'lg:col-span-4',
  }

  return (
    <section id="services" className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 atmospheric-grid opacity-55" />
      <div className="absolute top-0 left-1/4 -z-10 h-125 w-125 -translate-x-1/2 rounded-full bg-accent-ice/12 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-125 w-125 translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <div className="section-shell relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,1.22fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <FadeIn delay={0.15}>
              <div className="editorial-kicker mb-6">
                <StarFall className="h-4 w-4" />
                {t('badge')}
              </div>
            </FadeIn>

            <RevealText
              text={`${t('title.part1')} ${t('title.part2')}`}
              className="max-w-xl font-heading text-4xl font-semibold tracking-[-0.08em] text-foreground sm:text-5xl lg:text-6xl"
            />

            <FadeIn delay={0.35}>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg">
                {t('subtitle')}
              </p>
            </FadeIn>

            <FadeIn delay={0.45}>
              <div className="mt-10 space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="surface-panel flex items-center justify-between rounded-[1.2rem] px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-foreground">{service.title}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                      {service.category.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <div>
            <StaggerContainer staggerDelay={0.1}>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
                {services.map((service) => (
                  <StaggerItem key={service.id} className={serviceLayouts[service.id]}>
                    <ServiceCard
                      title={service.title}
                      description={service.description}
                      features={service.features}
                      icon={service.icon}
                      eyebrow={service.category.toUpperCase()}
                      popular={service.popular}
                    />
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>

            <FadeIn delay={0.7}>
              <div className="surface-panel-strong mt-8 overflow-hidden rounded-4xl p-6 shadow-card sm:p-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                      <StarFall className="h-3.5 w-3.5" />
                      {t('cta.badge')}
                    </div>

                    <h3 className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-foreground sm:text-3xl">
                      {t('cta.title')}
                    </h3>

                    <p className="mt-3 max-w-2xl text-base leading-8 text-muted">
                      {t('cta.subtitle')}
                    </p>
                  </div>

                  <MagneticHover strength={12}>
                    <a
                      href="#contact"
                      className="inline-flex min-h-13 items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      {t('cta.button')}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </MagneticHover>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
