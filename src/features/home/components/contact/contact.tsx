'use client'

import { Code2, Monitor, SquareArrowRightUp } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import { FadeIn, StaggerContainer, StaggerItem } from '@/shared/components/animations'

import { contactMethods, socialLinks } from '@/shared/lib/social-links'

import { ContactForm } from './contactForm/contactForm'

export const Contact = (): React.ReactElement => {
  const t = useTranslations('contact')

  const emailLink = socialLinks.email
  const linkedinLink = socialLinks.linkedin
  const whatsappMethod = contactMethods.whatsapp

  const contactMethodsArray = [
    {
      icon: emailLink.icon,
      title: t('methods.email.title'),
      description: t('methods.email.description'),
      action: t('methods.email.action'),
      href: emailLink.href,
      color: 'blue' as const,
      endpoint: 'POST',
    },
    {
      icon: linkedinLink.icon,
      title: t('methods.linkedin.title'),
      description: t('methods.linkedin.description'),
      action: t('methods.linkedin.action'),
      href: linkedinLink.href,
      color: 'blue' as const,
      endpoint: 'CONNECT',
    },
    {
      icon: whatsappMethod.icon,
      title: t('methods.phone.title'),
      description: t('methods.phone.description'),
      action: t('methods.phone.action'),
      href: whatsappMethod.href,
      color: 'green' as const,
      endpoint: 'SEND',
    },
  ]

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-28 lg:py-36 dark:bg-slate-950"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Code pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-size-[24px_24px] dark:bg-[linear-gradient(rgba(51,65,85,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.2)_1px,transparent_1px)]" />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute bottom-1/4 right-0 h-[600px] w-[600px] translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center lg:mb-20">
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-mono text-sm font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 font-mono text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl xl:text-6xl dark:text-slate-100">
              {t('title.part1')}{' '}
              <span className="bg-linear-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400">
                {t('title.part2')}
              </span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Form - Terminal Style */}
          <FadeIn delay={0.8} direction="left">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl dark:border-slate-800/60 dark:bg-slate-900">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/80">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="ml-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="font-mono">contact-form.tsx</span>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 sm:p-8">
                {/* Code comment style header */}
                <div className="mb-6 font-mono text-sm text-slate-500 dark:text-slate-400">
                  <p className="text-emerald-600 dark:text-emerald-400">
                    {'// '}
                    {t('form.title')}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500">
                    {'/* '}
                    {t('form.subtitle')}
                    {' */'}
                  </p>
                </div>

                <ContactForm />
              </div>
            </div>
          </FadeIn>

          {/* Contact Methods - API Style */}
          <FadeIn delay={1.0} direction="right">
            <div className="flex flex-col justify-center">
              {/* Header */}
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-slate-400" />
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    API Endpoints
                  </span>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {t('methods.title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{t('methods.subtitle')}</p>
              </div>

              {/* Methods as API Cards */}
              <StaggerContainer staggerDelay={0.15}>
                <div className="space-y-4">
                  {contactMethodsArray.map((method) => {
                    const IconComponent = method.icon
                    return (
                      <StaggerItem key={method.title}>
                        <a
                          href={method.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block overflow-hidden rounded-xl border border-slate-200/60 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/80 dark:hover:border-slate-700"
                        >
                          {/* Top bar with endpoint method */}
                          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2 dark:border-slate-800 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                                  method.color === 'green'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}
                              >
                                {method.endpoint}
                              </span>
                              <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                                /api/contact/{method.title.toLowerCase().replace(/\s/g, '-')}
                              </span>
                            </div>
                            <SquareArrowRightUp className="h-3.5 w-3.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>

                          {/* Content */}
                          <div className="flex items-center gap-4 p-4">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                                method.color === 'green'
                                  ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/30 dark:bg-emerald-900/20 dark:text-emerald-400'
                                  : 'bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 dark:bg-blue-900/20 dark:text-blue-400'
                              }`}
                            >
                              <IconComponent className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                {method.title}
                              </h4>
                              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                {method.description}
                              </p>
                            </div>
                            <div className="hidden sm:block">
                              <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  method.color === 'green'
                                    ? 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : 'bg-blue-50 text-blue-700 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
                                }`}
                              >
                                {method.action}
                              </span>
                            </div>
                          </div>
                        </a>
                      </StaggerItem>
                    )
                  })}
                </div>
              </StaggerContainer>

              {/* Status indicator */}
              <FadeIn delay={1.4}>
                <div className="mt-8 rounded-xl border border-slate-200/60 bg-slate-100/50 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                      </span>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {t('status.available')}
                      </p>
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {t('status.response')}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
