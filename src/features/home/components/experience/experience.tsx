import { Buildings, Calendar, MapPoint } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import {
  FadeIn,
  ParallaxLayer,
  RevealText,
  StaggerContainer,
  StaggerItem,
} from '@/shared/components/animations'
import { cn } from '@/shared/lib/utils'
import { CompanyMark } from './company-mark'
import { experiences } from './experience.static'

export function Experience() {
  const t = useTranslations('experience')
  const items = experiences(t)

  return (
    <section id="experience" className="relative overflow-hidden py-14 sm:py-20 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 atmospheric-grid opacity-50" />
      <div className="absolute top-1/3 left-0 -z-10 h-125 w-125 -translate-x-1/2 rounded-full bg-accent-ice/14 blur-[140px]" />
      <div className="absolute top-1/2 right-0 -z-10 h-125 w-125 translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />

      <div className="section-shell relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <FadeIn delay={0.15}>
              <div className="editorial-kicker mb-6">
                <Buildings className="h-4 w-4" />
                {t('badge')}
              </div>
            </FadeIn>

            <RevealText
              text={`${t('title.part1')} ${t('title.part2')}`}
              className="max-w-xl font-heading text-3xl font-semibold tracking-[-0.08em] text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
            />

            <FadeIn delay={0.35}>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:mt-6 sm:leading-8 sm:text-lg">
                {t('subtitle')}
              </p>
            </FadeIn>

            <FadeIn delay={0.45} blur>
              <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:gap-3">
                {items.map((exp, index) => (
                  <div
                    key={exp.company}
                    className="surface-panel flex items-center justify-between rounded-[1.25rem] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {exp.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-mono">{exp.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <StaggerContainer staggerDelay={0.14}>
            <div className="relative flex flex-col gap-4 sm:gap-5 lg:gap-6 lg:pt-6">
              <div className="absolute top-0 bottom-0 left-8 hidden w-px bg-linear-to-b from-line/20 via-foreground/12 to-transparent lg:block" />

              {items.map((exp, index) => (
                <StaggerItem key={exp.company}>
                  <ParallaxLayer offset={18 + index * 4}>
                    <article
                      className={cn(
                        'surface-panel-strong relative overflow-hidden rounded-3xl p-4 shadow-card sm:rounded-4xl sm:p-6 lg:p-8',
                        index % 2 === 1 ? 'lg:ml-10' : 'lg:mr-10',
                      )}
                    >
                      <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-accent/12 blur-3xl" />
                      <div className="absolute top-8 left-8 hidden h-4 w-4 rounded-full border border-line bg-surface lg:block" />

                      <div className="relative grid gap-4">
                        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
                          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                            <CompanyMark
                              logo={exp.logo}
                              company={exp.company}
                              alt={t('logoAlt', { company: exp.company })}
                            />

                            <div className="min-w-0 max-w-xl">
                              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                                {String(index + 1).padStart(2, '0')}
                              </p>
                              <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-foreground sm:text-2xl">
                                {exp.position}
                              </h3>
                              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-muted sm:justify-start">
                                <span className="font-semibold text-foreground">{exp.company}</span>
                                <span className="hidden h-1 w-1 rounded-full bg-muted/50 sm:block" />
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {exp.period}
                                </span>
                                <span className="hidden h-1 w-1 rounded-full bg-muted/50 sm:block" />
                                <span className="flex items-center gap-1">
                                  <MapPoint className="h-3.5 w-3.5" />
                                  {exp.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          {exp.current && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:self-start dark:text-emerald-300">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                              </span>
                              {t('currentLabel')}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="relative mt-7 text-base leading-8 text-muted">
                        {exp.description}
                      </p>

                      <div className="relative mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                            {t('highlightsTitle')}
                          </p>
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {exp.highlights.map((highlight) => (
                              <div
                                key={highlight}
                                className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-6 text-foreground"
                              >
                                {highlight}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="xl:max-w-72">
                          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                            {t('technologiesTitle')}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {exp.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-foreground"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  </ParallaxLayer>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}
