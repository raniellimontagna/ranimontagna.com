import { ArrowDown, SquareArrowRightUp } from '@solar-icons/react/ssr'
import { getTranslations } from 'next-intl/server'
import { MagneticHover, RevealText } from '@/shared/components/animations'
import { getSocialLinksAsArray } from '@/shared/lib/social-links'
import { ScrollIndicator } from './hero-content'
import { HeroVisual } from './hero-visual'

export async function Hero() {
  const t = await getTranslations('hero')
  const heroSocialLinkIds = ['github', 'linkedin', 'email']
  const socialLinks = getSocialLinksAsArray()
    .filter((social) => heroSocialLinkIds.includes(social.id))
    .map((social) =>
      social.id === 'email' && social.direct
        ? { ...social, href: `mailto:${social.direct}` }
        : social,
    )

  return (
    <section
      id="start"
      data-testid="hero"
      className="section-shell relative flex min-h-screen items-center overflow-hidden px-4 pt-32 pb-24 sm:px-6 sm:pt-36 lg:px-8 lg:pt-40 lg:pb-28"
      aria-label="Hero section - Ranielli Montagna introduction"
    >
      <div className="pointer-events-none absolute inset-0 atmospheric-grid opacity-55" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(221,255,111,0.16),transparent_30%),radial-gradient(circle_at_85%_12%,rgba(148,215,255,0.18),transparent_28%),linear-gradient(180deg,transparent_0%,rgba(7,11,12,0.05)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(221,255,111,0.14),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(148,215,255,0.16),transparent_30%),linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.22)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-background to-transparent" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -top-16 -right-10 h-64 w-64 rounded-full bg-ambient-ice blur-3xl" />
        <div className="animate-orbital-shift absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-ambient-lime blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:gap-10">
        <div className="relative">
          <div className="mt-8 flex flex-col gap-6 sm:mt-10">
            <div className="flex flex-col gap-4">
              <p className="font-mono text-sm font-medium tracking-[0.24em] text-muted uppercase">
                {t('greeting')}
              </p>

              <h1 className="max-w-[12ch] text-[clamp(2.5rem,12vw,3rem)] leading-[0.95] font-semibold tracking-[-0.07em] text-foreground sm:text-7xl lg:text-[5.6rem]">
                <RevealText text={t('name')} mode="word" stagger={0.06} />
              </h1>
            </div>

            <div className="max-w-3xl flex flex-col gap-5">
              <p className="text-xl leading-[1.08] font-medium text-foreground sm:text-3xl lg:text-[2.6rem]">
                {t('passion.part1')}{' '}
                <span className="inline-block rounded-lg bg-accent px-2 py-0.5 font-bold text-white dark:rounded-none dark:bg-transparent dark:bg-linear-to-r dark:from-accent dark:to-accent-strong dark:bg-clip-text dark:p-0 dark:text-transparent">
                  {t('passion.highlight')}
                </span>{' '}
                {t('passion.part2')}
              </p>

              <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                {t('description')}
              </p>

              <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                {t('seoDescription')}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
            <MagneticHover className="w-full sm:w-auto">
              <a
                href="#projects"
                className="group flex w-full items-center justify-center gap-2 rounded-full border border-line bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-(--shadow-soft) sm:inline-flex sm:w-auto"
              >
                <span>{t('cta.projects')}</span>
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </a>
            </MagneticHover>

            <MagneticHover className="w-full sm:w-auto">
              <a
                href="#contact"
                className="group flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-foreground sm:inline-flex sm:w-auto"
              >
                <span>{t('cta.contact')}</span>
                <SquareArrowRightUp className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </MagneticHover>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:justify-start">
            {socialLinks.map((social) => {
              const Icon = social.icon

              return (
                <MagneticHover key={social.id}>
                  <a
                    href={social.href}
                    target={social.external ? '_blank' : undefined}
                    rel={social.external ? 'noopener noreferrer' : undefined}
                    className="surface-panel inline-flex h-11 w-11 items-center justify-center rounded-2xl text-foreground"
                    aria-label={social.ariaLabel || social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </MagneticHover>
              )
            })}
          </div>
        </div>

        <HeroVisual />
      </div>

      <ScrollIndicator />
    </section>
  )
}
