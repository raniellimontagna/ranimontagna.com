import { SquareArrowRightUp } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import { FadeIn, MagneticHover, RevealText } from '@/shared/components/animations'
import { contactMethods, socialLinks } from '@/shared/lib/social-links'
import { AttoMark } from '../services/atto-mark'
import { ContactForm } from './contactForm/contactForm'
import { CopyEmail } from './copy-email'
import { LocalTime } from './local-time'

const ATTO_URL = 'https://attodev.com.br'

/**
 * Contato em dois caminhos: projeto vai para a Atto, conversa fica aqui.
 * Esquerda enxuta (e-mail grande, canais em pílulas, horário local); direita o formulário.
 */
export const Contact = (): React.ReactElement => {
  const t = useTranslations('contact')

  const email = socialLinks.email.direct ?? ''
  const channels = [
    {
      id: 'linkedin',
      icon: socialLinks.linkedin.icon,
      title: t('methods.linkedin.title'),
      href: socialLinks.linkedin.href,
    },
    {
      id: 'whatsapp',
      icon: contactMethods.whatsapp.icon,
      title: t('methods.phone.title'),
      href: contactMethods.whatsapp.href,
    },
    {
      id: 'github',
      icon: socialLinks.github.icon,
      title: 'GitHub',
      href: socialLinks.github.href,
    },
  ]

  return (
    <section
      id="contact"
      data-spectral-zone="focus"
      className="relative overflow-hidden py-14 sm:py-20 lg:py-32"
    >
      <div className="section-shell relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <FadeIn delay={0.15}>
              <div className="editorial-kicker mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                {t('badge')}
              </div>
            </FadeIn>

            <RevealText
              as="h2"
              text={`${t('title.part1')} ${t('title.part2')}`}
              className="max-w-xl font-heading text-3xl font-semibold tracking-[-0.08em] text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
            />

            <FadeIn delay={0.3}>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:mt-6 sm:leading-8 sm:text-lg">
                {t('subtitle')}
              </p>
            </FadeIn>

            {/* Dois caminhos */}
            <FadeIn delay={0.4}>
              <div className="mt-8 divide-y divide-line border-y border-line">
                <a
                  href={ATTO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 py-5 transition-colors hover:text-foreground"
                  aria-label={t('methods.atto.title')}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent-strong dark:text-accent">
                    <AttoMark className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-foreground">
                      {t('paths.project.title')}
                    </span>
                    <span className="block text-sm text-muted">
                      {t('paths.project.description')}
                    </span>
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-foreground sm:inline-flex">
                    {t('paths.project.action')}
                    <SquareArrowRightUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
                <div className="py-5">
                  <p className="font-semibold text-foreground">{t('paths.talk.title')}</p>
                  <p className="mt-1 text-sm text-muted">{t('paths.talk.description')}</p>
                  <div className="mt-4">
                    <span className="sr-only">{t('methods.email.title')}</span>
                    <CopyEmail
                      email={email}
                      labels={{
                        copy: t('email.copy'),
                        copied: t('email.copied'),
                        open: t('email.open'),
                      }}
                    />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Canais + horário local */}
            <FadeIn delay={0.5}>
              <nav
                className="mt-6 flex flex-wrap items-center gap-2"
                aria-label={t('methods.title')}
              >
                <span className="sr-only">{t('methods.title')}</span>
                {channels.map((channel) => {
                  const Icon = channel.icon
                  return (
                    <MagneticHover key={channel.id} strength={8}>
                      <a
                        href={channel.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-strong"
                      >
                        <Icon className="h-4 w-4" />
                        {channel.title}
                      </a>
                    </MagneticHover>
                  )
                })}
              </nav>
              <div className="mt-6 flex flex-col gap-2">
                <LocalTime label={t('localTime.label')} timezone={t('localTime.timezone')} />
                <p className="flex flex-wrap gap-x-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                  <span>{t('status.available')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t('status.response')}</span>
                </p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.35} blur className="lg:pt-2">
            <div className="surface-panel-strong relative overflow-hidden rounded-3xl p-5 shadow-card sm:rounded-4xl sm:p-8">
              <div className="absolute inset-0 glow-gradient" />
              <div className="relative">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.04em] text-foreground sm:text-2xl">
                      {t('form.title')}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{t('form.subtitle')}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    {t('status.response')}
                  </span>
                </div>
                <ContactForm />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
