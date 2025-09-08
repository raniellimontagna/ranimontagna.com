'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { socialLinks } from '@/constants/socialLinks'

export function Footer() {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center not-md:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FadeIn>
            <div className="flex items-center space-x-3">
              <Image
                src="logo/white.svg"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('logo.fullName')}
                </h3>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <StaggerContainer staggerDelay={0.1}>
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon

                  return (
                    <StaggerItem key={social.id}>
                      <a
                        href={social.href}
                        target={social.external ? '_blank' : undefined}
                        rel={social.external ? 'noopener noreferrer' : undefined}
                        className="group flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-all duration-300 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-blue-600 dark:hover:text-white"
                        aria-label={social.ariaLabel || social.name}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    </StaggerItem>
                  )
                })}
              </div>
            </StaggerContainer>
          </FadeIn>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              {t('copyright', { year: currentYear })}
            </p>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              {t('madeWith')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
