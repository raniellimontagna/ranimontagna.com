'use client'

import { ExternalLink, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'

import { contactMethods, socialLinks } from '@/constants/socialLinks'

import { ContactForm } from './contactForm/contactForm'

export function Contact() {
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
      color: 'blue',
    },
    {
      icon: linkedinLink.icon,
      title: t('methods.linkedin.title'),
      description: t('methods.linkedin.description'),
      action: t('methods.linkedin.action'),
      href: linkedinLink.href,
      color: 'blue',
    },
    {
      icon: whatsappMethod.icon,
      title: t('methods.phone.title'),
      description: t('methods.phone.description'),
      action: t('methods.phone.action'),
      href: whatsappMethod.href,
      color: 'green',
    },
  ]

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-32 dark:bg-slate-950"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 font-mono text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
              <MessageCircle className="mr-2 h-4 w-4" />
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-100">
              {t('title.part1')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                {t('title.part2')}
              </span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-400">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeIn delay={0.8} direction="left">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/50 p-8 shadow-xl backdrop-blur-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mb-8">
                <h3 className="mb-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {t('form.title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{t('form.subtitle')}</p>
              </div>
              <ContactForm />
            </div>
          </FadeIn>

          <FadeIn delay={1.0} direction="right">
            <div className="flex flex-col justify-center">
              <div className="mb-10">
                <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {t('methods.title')}
                </h3>
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  {t('methods.subtitle')}
                </p>
              </div>

              <StaggerContainer staggerDelay={0.15}>
                <div className="space-y-6">
                  {contactMethodsArray.map((method) => {
                    const IconComponent = method.icon
                    return (
                      <StaggerItem key={method.title}>
                        <a
                          href={method.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                        >
                          {/* Hover Glow */}
                          <div
                            className={`absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r ${method.color === 'blue' ? 'from-blue-500/10 to-transparent' : 'from-green-500/10 to-transparent'}`}
                          />

                          <div
                            className={`mr-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                              method.color === 'blue'
                                ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-900/30'
                                : 'bg-green-50 text-green-600 group-hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:group-hover:bg-green-900/30'
                            }`}
                          >
                            <IconComponent className="h-7 w-7" />
                          </div>
                          <div className="flex-1">
                            <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                              {method.title}
                              <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-50" />
                            </h4>
                            <p className="mb-1 text-sm text-slate-500 dark:text-slate-500">
                              {method.description}
                            </p>
                            <p
                              className={`text-sm font-semibold ${
                                method.color === 'blue'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              {method.action}
                            </p>
                          </div>
                        </a>
                      </StaggerItem>
                    )
                  })}
                </div>
              </StaggerContainer>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
