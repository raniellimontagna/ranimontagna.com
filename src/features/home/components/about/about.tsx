import { ChatRound, Download, User } from '@solar-icons/react/ssr'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import {
  BlurReveal,
  CountUp,
  FadeIn,
  MagneticHover,
  ParallaxLayer,
  RevealText,
} from '@/shared/components/animations'
import { getResumeByLocale } from '@/shared/lib/social-links'

export function About() {
  const t = useTranslations('about')
  const locale = useLocale()
  const resumeLink = getResumeByLocale(locale as 'en' | 'pt' | 'es')
  const photoName = t('bio.name')
  const stats = [
    { value: 4, suffix: '+', label: t('stats.experience') },
    { value: 20, suffix: '+', label: t('stats.projects') },
  ]

  return (
    <section
      id="about"
      data-testid="about"
      className="relative overflow-hidden py-14 sm:py-20 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 atmospheric-grid opacity-60" />
      <div className="absolute top-0 right-0 -z-10 h-125 w-125 rounded-full bg-accent/10 blur-[140px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-125 w-125 rounded-full bg-accent-ice/16 blur-[140px]" />

      <div className="section-shell relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-center lg:gap-18">
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
                className="font-heading text-3xl font-semibold tracking-[-0.08em] text-foreground sm:text-4xl md:text-5xl lg:text-7xl"
              />

              <FadeIn delay={0.3} blur>
                <div className="mt-5 flex flex-col gap-4 text-base leading-7 text-muted sm:mt-8 sm:gap-5 sm:leading-8 sm:text-lg">
                  <p>
                    {t('bio.greeting')}{' '}
                    <strong className="font-semibold text-foreground">{t('bio.name')}</strong>,{' '}
                    {t('bio.intro')}
                  </p>
                  <p>{t('bio.journey')}</p>
                  <p>{t('bio.hobbies')}</p>
                </div>
              </FadeIn>

              <FadeIn delay={0.45}>
                <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2">
                  {stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className="surface-panel rounded-2xl px-4 py-4 backdrop-blur-sm sm:rounded-3xl sm:px-5 sm:py-5"
                    >
                      <CountUp
                        value={stat.value}
                        suffix={stat.suffix}
                        delay={0.5 + index * 0.15}
                        className="font-heading text-3xl font-semibold tracking-[-0.08em] text-foreground"
                      />
                      <p className="mt-2 text-sm leading-6 text-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.55}>
                <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                  <MagneticHover strength={16} className="w-full sm:w-auto">
                    <a
                      href={resumeLink.href}
                      download={resumeLink.filename}
                      className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-background transition-transform duration-300 sm:inline-flex sm:w-auto hover:-translate-y-0.5"
                    >
                      <Download className="h-4 w-4" />
                      {resumeLink.name}
                    </a>
                  </MagneticHover>

                  <MagneticHover strength={14} className="w-full sm:w-auto">
                    <a
                      href="#contact"
                      className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 py-3 text-sm font-semibold text-foreground transition-colors sm:inline-flex sm:w-auto hover:border-foreground/30 hover:bg-surface-strong"
                    >
                      <ChatRound className="h-4 w-4" />
                      {t('cta.contact')}
                    </a>
                  </MagneticHover>
                </div>
              </FadeIn>
            </div>
          </div>

          <BlurReveal delay={0.2} className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
              <div className="pointer-events-none absolute inset-x-8 top-8 h-[82%] rounded-[2.5rem] bg-accent/12 blur-3xl" />

              <ParallaxLayer offset={26}>
                <div className="relative isolate">
                  <div className="pointer-events-none absolute -inset-x-3 top-8 bottom-10 rotate-[-4deg] rounded-[2.75rem] border border-line/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.02))] opacity-90 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
                  <div className="pointer-events-none absolute top-10 -right-3 bottom-16 hidden w-18 rounded-[2rem] border border-line bg-surface/65 shadow-(--shadow-soft) backdrop-blur-sm lg:block" />

                  <div className="surface-panel-strong relative overflow-hidden rounded-[2rem] p-3 shadow-(--shadow-panel) sm:rounded-[2.35rem] sm:p-4 md:p-5">
                    <div className="absolute inset-0 glow-gradient-photo opacity-90" />
                    <div className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full bg-white/25 blur-3xl dark:bg-white/6" />

                    <div className="relative overflow-hidden rounded-[1.65rem] border border-white/55 bg-canvas dark:border-white/10">
                      <div className="relative aspect-4/5 sm:aspect-[5/6]">
                        <Image
                          src="/photo.webp"
                          alt={photoName}
                          fill
                          priority
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 544px"
                          quality={100}
                          className="object-cover object-center brightness-[0.98] contrast-[1.05] saturate-[0.92] transition-transform duration-700 hover:scale-[1.08]"
                        />
                      </div>

                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.1),transparent_28%,rgba(5,10,12,0.16)_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_28%,rgba(0,0,0,0.44)_100%)]" />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.18)_0%,transparent_24%,transparent_78%,rgba(255,255,255,0.12)_100%)] mix-blend-screen opacity-70" />

                      <div className="absolute inset-x-4 bottom-4 rounded-[1.35rem] border border-white/18 bg-black/50 px-4 py-4 backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:px-5">
                        <p className="font-heading text-xl font-semibold tracking-[-0.06em] text-white sm:text-2xl">
                          {photoName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ParallaxLayer>
            </div>
          </BlurReveal>
        </div>
      </div>
    </section>
  )
}
