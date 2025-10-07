'use client'

import { useTranslations } from 'next-intl'
import { MessageCircle, ExternalLink } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'

import { socialLinks, contactMethods } from '@/constants/socialLinks'

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
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-32 dark:bg-slate-900"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-700/20"></div>
        <div className="absolute bottom-32 left-32 h-80 w-80 rounded-full bg-purple-300/10 blur-3xl dark:bg-purple-600/10"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <MessageCircle className="mr-2 h-4 w-4" />
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-6xl dark:text-slate-100">
              {t('title.part1')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('title.part2')}
              </span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mx-auto max-w-3xl text-lg text-slate-600 sm:text-xl dark:text-slate-300">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn delay={0.8} direction="left">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {t('form.title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">{t('form.subtitle')}</p>
              </div>
              <ContactForm />
            </div>
          </FadeIn>

          <FadeIn delay={1.0} direction="right">
            <div>
              <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t('methods.title')}
              </h3>
              <p className="mb-8 text-slate-600 dark:text-slate-300">{t('methods.subtitle')}</p>

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
                          className="group flex items-center rounded-lg border border-slate-200 bg-white p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                        >
                          <div
                            className={`mr-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                              method.color === 'blue'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-green-100 dark:bg-green-900/30'
                            }`}
                          >
                            <IconComponent
                              className={`h-6 w-6 ${
                                method.color === 'blue'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              {method.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {method.description}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300" />
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
