import { SquareArrowRightUp } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import {
  FadeIn,
  MagneticHover,
  RevealText,
  StaggerContainer,
  StaggerItem,
} from '@/shared/components/animations'
import { AttoMark } from './atto-mark'
import { ATTO_CASES_URL, ATTO_URL, servicesData } from './services.static'
import type { ServiceType } from './services.types'

/**
 * Ponte para a Atto: quem chega aqui com um projeto para construir é direcionado
 * para a software house, não para um orçamento pessoal.
 */
export function Services() {
  const t = useTranslations('services')

  const services: ServiceType[] = servicesData.map((s) => ({
    ...s,
    title: t(`list.${s.id}.title`),
    description: t(`list.${s.id}.description`),
  }))

  return (
    <section
      id="services"
      data-spectral-zone="balanced"
      className="relative overflow-hidden py-14 sm:py-20 lg:py-32"
    >
      <div className="section-shell relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="surface-panel-strong relative overflow-hidden rounded-3xl p-5 shadow-card sm:rounded-4xl sm:p-8 lg:p-12">
          <div className="absolute inset-0 glow-gradient" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <FadeIn delay={0.15}>
                <div className="editorial-kicker mb-6">
                  <AttoMark className="h-4 w-4" />
                  {t('badge')}
                </div>
              </FadeIn>

              <RevealText
                as="h2"
                text={`${t('title.part1')} ${t('title.part2')}`}
                className="max-w-2xl font-heading text-3xl font-semibold tracking-[-0.08em] text-foreground sm:text-4xl md:text-5xl"
              />

              <FadeIn delay={0.35} blur>
                <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:mt-6 sm:leading-8 sm:text-lg">
                  {t('subtitle')}
                </p>
              </FadeIn>

              <FadeIn delay={0.5}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <MagneticHover strength={12} className="w-full sm:w-auto">
                    <a
                      href={ATTO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform duration-300 sm:inline-flex sm:w-auto hover:-translate-y-0.5"
                    >
                      {t('cta.button')}
                      <SquareArrowRightUp className="h-4 w-4" />
                    </a>
                  </MagneticHover>
                  <MagneticHover strength={10} className="w-full sm:w-auto">
                    <a
                      href={ATTO_CASES_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors sm:inline-flex sm:w-auto hover:border-foreground/30 hover:bg-surface-strong"
                    >
                      {t('cta.secondary')}
                    </a>
                  </MagneticHover>
                </div>
              </FadeIn>

              <FadeIn delay={0.6}>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                  {t('cta.badge')} · {t('cta.subtitle')}
                </p>
              </FadeIn>
            </div>

            <StaggerContainer staggerDelay={0.1}>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {services.map((service) => {
                  const Icon = service.icon
                  return (
                    <StaggerItem key={service.id}>
                      <li
                        className="flex items-start gap-4 rounded-2xl border border-line bg-surface px-4 py-4"
                        data-testid="atto-front"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent-strong dark:text-accent">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-foreground">
                            {service.title}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-muted">
                            {service.description}
                          </span>
                        </span>
                      </li>
                    </StaggerItem>
                  )
                })}
              </ul>
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
