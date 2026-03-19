import { ArrowDown, SquareArrowRightUp } from '@solar-icons/react/ssr'
import { getTranslations } from 'next-intl/server'
import { MagneticHover, RevealText } from '@/shared/components/animations'
import { getSocialLinksAsArray } from '@/shared/lib/social-links'
import { ScrollIndicator } from './hero-content'
import { HeroVisual } from './hero-visual'

export async function Hero() {
  const t = await getTranslations('hero')
  const skillsList = t.raw('skills.list') as string[]
  const socialLinks = getSocialLinksAsArray().map((social) =>
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-[color:var(--background)] to-transparent" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -top-16 -right-10 h-64 w-64 rounded-full bg-[color:var(--ambient-ice)] blur-3xl" />
        <div className="animate-orbital-shift absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-[color:var(--ambient-lime)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:gap-10">
        <div className="relative">
          <div className="editorial-kicker text-[color:var(--foreground)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-[color:var(--accent)] opacity-80" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--accent)]" />
            </span>
            {t('availability')}
          </div>

          <div className="mt-8 space-y-6 sm:mt-10">
            <div className="space-y-4">
              <p className="font-mono text-sm font-medium tracking-[0.24em] text-[color:var(--muted)] uppercase">
                {t('greeting')}
              </p>

              <h1 className="max-w-[12ch] text-5xl leading-[0.88] font-semibold tracking-[-0.07em] text-[color:var(--foreground)] sm:text-7xl lg:text-[5.6rem]">
                <RevealText text={t('name')} mode="word" stagger={0.06} />
              </h1>
            </div>

            <div className="max-w-3xl space-y-5">
              <p className="text-xl leading-[1.08] font-medium text-[color:var(--foreground)] sm:text-3xl lg:text-[2.6rem]">
                {t('passion.part1')}{' '}
                <span className="text-[color:var(--accent)]">{t('passion.highlight')}</span>{' '}
                {t('passion.part2')}
              </p>

              <p className="max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
                {t('description')}
              </p>

              <p className="max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
                {t('seoDescription')}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
            <MagneticHover>
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--background)] shadow-[var(--shadow-soft)]"
              >
                <span>{t('cta.projects')}</span>
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </a>
            </MagneticHover>

            <MagneticHover>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)]"
              >
                <span>{t('cta.contact')}</span>
                <SquareArrowRightUp className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </MagneticHover>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
            {socialLinks.map((social) => {
              const Icon = social.icon

              return (
                <MagneticHover key={social.id}>
                  <a
                    href={social.href}
                    target={social.external ? '_blank' : undefined}
                    rel={social.external ? 'noopener noreferrer' : undefined}
                    className="surface-panel inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[color:var(--foreground)]"
                    aria-label={social.ariaLabel || social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </MagneticHover>
              )
            })}
          </div>

          <div className="mt-10 space-y-4 sm:mt-12">
            <p className="font-mono text-xs font-semibold tracking-[0.22em] text-[color:var(--muted)] uppercase">
              {t('skills.title')}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {skillsList.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 font-mono text-[0.72rem] font-medium text-[color:var(--foreground)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <HeroVisual
          availability={t('availability')}
          skillsTitle={t('skills.title')}
          skillsList={skillsList}
        />
      </div>

      <ScrollIndicator />
    </section>
  )
}
