import { ChatRound, Download, User } from '@solar-icons/react/ssr'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { FadeIn, MagneticHover, ParallaxLayer, RevealText } from '@/shared/components/animations'
import { getResumeByLocale } from '@/shared/lib/social-links'

export function About() {
  const t = useTranslations('about')
  const locale = useLocale()
  const resumeLink = getResumeByLocale(locale as 'en' | 'pt' | 'es')
  const stats = [
    { value: '03+', label: t('stats.experience') },
    { value: '20+', label: t('stats.projects') },
    { value: '100%', label: t('stats.dedication') },
  ]
  const focusAreas = [
    t('skills.technologies.react'),
    t('skills.technologies.nextjs'),
    t('skills.technologies.typescript'),
    t('skills.technologies.designSystem'),
  ]

  return (
    <section
      id="about"
      data-testid="about"
      className="relative overflow-hidden py-20 sm:py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 atmospheric-grid opacity-60" />
      <div className="absolute top-0 right-0 -z-10 h-125 w-125 rounded-full bg-accent/10 blur-[140px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-125 w-125 rounded-full bg-accent-ice/16 blur-[140px]" />

      <div className="section-shell relative z-10">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-start lg:gap-18">
          <div className="order-2 lg:order-1">
            <FadeIn delay={0.1}>
              <div className="editorial-kicker mb-6">
                <User className="h-4 w-4" />
                {t('badge')}
              </div>
            </FadeIn>

            <div className="max-w-3xl">
              <RevealText
                text={`${t('title.part1')} ${t('title.part2')}`}
                className="font-heading text-4xl font-semibold tracking-[-0.08em] text-foreground sm:text-5xl lg:text-7xl"
              />

              <FadeIn delay={0.3}>
                <div className="mt-8 space-y-5 text-base leading-8 text-muted sm:text-lg">
                  <p>
                    {t('bio.greeting')}{' '}
                    <strong className="font-semibold text-foreground">
                      {t('bio.name')}
                    </strong>
                    , {t('bio.intro')}
                  </p>
                  <p>{t('bio.journey')}</p>
                  <p>{t('bio.hobbies')}</p>
                </div>
              </FadeIn>

              <FadeIn delay={0.45}>
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="surface-panel rounded-3xl px-5 py-5 backdrop-blur-sm"
                    >
                      <p className="font-heading text-3xl font-semibold tracking-[-0.08em] text-foreground">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.55}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <MagneticHover strength={16}>
                    <a
                      href={resumeLink.href}
                      download={resumeLink.filename}
                      className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      <Download className="h-4 w-4" />
                      {resumeLink.name}
                    </a>
                  </MagneticHover>

                  <MagneticHover strength={14}>
                    <a
                      href="#contact"
                      className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-strong"
                    >
                      <ChatRound className="h-4 w-4" />
                      {t('cta.contact')}
                    </a>
                  </MagneticHover>
                </div>
              </FadeIn>
            </div>
          </div>

          <FadeIn delay={0.25} direction="left" className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-125 lg:max-w-none">
              <ParallaxLayer offset={30}>
                <div className="surface-panel-strong relative overflow-hidden rounded-4xl p-4 shadow-card sm:p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(162,255,61,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(111,202,255,0.22),transparent_35%)]" />
                  <div className="relative aspect-4/5 overflow-hidden rounded-3xl border border-white/50 bg-canvas dark:border-white/10">
                    <Image
                      src="/photo.webp"
                      alt={t('bio.name')}
                      fill
                      sizes="(max-width: 1024px) 100vw, 460px"
                      className="object-cover object-center transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/30 via-transparent to-white/10" />
                  </div>

                  <div className="absolute top-4 left-4 rounded-full border border-white/55 bg-white/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-700 backdrop-blur sm:top-8 sm:left-8 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200">
                    {t('bio.name')}
                  </div>

                  <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-white/55 bg-white/85 p-4 shadow-2xl backdrop-blur sm:right-8 sm:bottom-8 sm:left-auto sm:max-w-72 dark:border-white/10 dark:bg-slate-950/78">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                      {t('skills.title')}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {focusAreas.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-line bg-surface-strong px-3 py-1.5 text-xs font-medium text-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ParallaxLayer>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
