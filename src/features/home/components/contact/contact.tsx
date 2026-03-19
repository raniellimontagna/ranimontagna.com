import { Code2, Monitor, SquareArrowRightUp } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import {
  BlurReveal,
  FadeIn,
  MagneticHover,
  ParallaxLayer,
  RevealText,
  StaggerContainer,
  StaggerItem,
} from '@/shared/components/animations'

import { contactMethods, socialLinks } from '@/shared/lib/social-links'

import { ContactForm } from './contactForm/contactForm'

export const Contact = (): React.ReactElement => {
  const t = useTranslations('contact')

  const emailLink = socialLinks.email
  const linkedinLink = socialLinks.linkedin
  const whatsappMethod = contactMethods.whatsapp
  const emailHref = emailLink.direct ? `mailto:${emailLink.direct}` : emailLink.href

  const contactMethodsArray = [
    {
      id: 'email',
      icon: emailLink.icon,
      title: t('methods.email.title'),
      description: t('methods.email.description'),
      action: t('methods.email.action'),
      href: emailHref,
      external: emailLink.external,
      color: 'blue' as const,
      endpoint: 'POST',
    },
    {
      id: 'linkedin',
      icon: linkedinLink.icon,
      title: t('methods.linkedin.title'),
      description: t('methods.linkedin.description'),
      action: t('methods.linkedin.action'),
      href: linkedinLink.href,
      external: linkedinLink.external,
      color: 'blue' as const,
      endpoint: 'CONNECT',
    },
    {
      id: 'whatsapp',
      icon: whatsappMethod.icon,
      title: t('methods.phone.title'),
      description: t('methods.phone.description'),
      action: t('methods.phone.action'),
      href: whatsappMethod.href,
      external: whatsappMethod.external,
      color: 'green' as const,
      endpoint: 'SEND',
    },
  ]

  return (
    <section id="contact" className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="atmospheric-grid absolute inset-0 opacity-55" />
        <div className="absolute top-1/4 left-0 h-150 w-150 -translate-x-1/2 rounded-full bg-accent-ice/14 blur-3xl" />
        <div className="absolute right-0 bottom-1/4 h-150 w-150 translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="section-shell relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:h-fit">
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
              text={`${t('title.part1')} ${t('title.part2')}`}
              className="max-w-xl font-heading text-4xl font-semibold tracking-[-0.08em] text-foreground sm:text-5xl lg:text-6xl"
            />

            <FadeIn delay={0.35}>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg">
                {t('subtitle')}
              </p>
            </FadeIn>

            <FadeIn delay={0.45} blur scale>
              <div className="surface-panel-strong mt-8 overflow-hidden rounded-3xl p-6 shadow-card">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                    {t('methods.email.title')}
                  </span>
                </div>

                <a
                  href={emailHref}
                  className="mt-4 inline-flex text-lg font-semibold tracking-[-0.04em] text-foreground transition-opacity hover:opacity-70 sm:text-xl"
                >
                  {emailLink.direct}
                </a>

                <div className="mt-6 rounded-3xl border border-line bg-surface px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/12">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                      </span>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold text-foreground">
                        {t('status.available')}
                      </p>
                      <p className="font-mono text-xs text-muted">{t('status.response')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="mt-10">
                <div className="mb-5">
                  <h3 className="text-2xl font-semibold tracking-[-0.05em] text-foreground">
                    {t('methods.title')}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-muted">{t('methods.subtitle')}</p>
                </div>

                <StaggerContainer staggerDelay={0.12}>
                  <div className="flex flex-col gap-4">
                    {contactMethodsArray.map((method) => {
                      const IconComponent = method.icon
                      return (
                        <StaggerItem key={method.title}>
                          <MagneticHover strength={10}>
                            <a
                              href={method.href}
                              target={method.external ? '_blank' : undefined}
                              rel={method.external ? 'noopener noreferrer' : undefined}
                              className="group block overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/16 hover:shadow-card"
                            >
                              <div className="flex items-center justify-between border-b border-line bg-surface-strong px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                      method.color === 'green'
                                        ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-sky-500/12 text-sky-700 dark:text-sky-300'
                                    }`}
                                  >
                                    {method.endpoint}
                                  </span>
                                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                                    /contact/{method.id}
                                  </span>
                                </div>
                                <SquareArrowRightUp className="h-3.5 w-3.5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                              </div>

                              <div className="flex items-center gap-4 p-4">
                                <div
                                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line transition-all duration-300 ${
                                    method.color === 'green'
                                      ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-sky-500/12 text-sky-700 dark:text-sky-300'
                                  }`}
                                >
                                  <IconComponent className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-foreground">{method.title}</h4>
                                  <p className="truncate text-sm text-muted">
                                    {method.description}
                                  </p>
                                </div>
                                <span className="hidden rounded-full border border-line bg-surface-strong px-3 py-1.5 text-xs font-semibold text-foreground sm:inline-flex">
                                  {method.action}
                                </span>
                              </div>
                            </a>
                          </MagneticHover>
                        </StaggerItem>
                      )
                    })}
                  </div>
                </StaggerContainer>
              </div>
            </FadeIn>
          </div>
          <BlurReveal delay={0.5}>
            <ParallaxLayer offset={26}>
              <div className="surface-panel-strong relative overflow-hidden rounded-4xl shadow-card">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,202,255,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_28%)]" />

                <div className="relative flex items-center gap-2 border-b border-line bg-surface-strong px-5 py-4">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="ml-2 flex items-center gap-2 text-xs text-muted">
                    <Monitor className="h-3.5 w-3.5" />
                    <span className="font-mono">contact-form.tsx</span>
                  </div>
                </div>

                <div className="relative p-6 sm:p-8 lg:p-10">
                  <div className="mb-8 grid gap-4 rounded-3xl border border-line bg-surface p-5 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="font-mono text-sm text-muted">
                      <p className="text-emerald-600 dark:text-emerald-400">
                        {'// '}
                        {t('form.title')}
                      </p>
                      <p className="mt-2 leading-6">
                        {'/* '}
                        {t('form.subtitle')}
                        {' */'}
                      </p>
                    </div>

                    <div className="rounded-full border border-line bg-surface-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                      {t('status.response')}
                    </div>
                  </div>

                  <ContactForm />
                </div>
              </div>
            </ParallaxLayer>
          </BlurReveal>
        </div>
      </div>
    </section>
  )
}
