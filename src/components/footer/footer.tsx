import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { getSocialLinksAsArray } from '@/constants/socialLinks'
import { useTheme } from '@/store/useTheme/useTheme'

export function Footer() {
  const t = useTranslations('footer')
  const { theme } = useTheme()
  const currentYear = new Date().getFullYear()
  const socialLinksArray = getSocialLinksAsArray()

  return (
    <footer className="relative border-t border-slate-200 bg-white pt-16 pb-8 dark:border-slate-800 dark:bg-slate-950">
      {/* Visual Top Highlight */}
      <div className="absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-50 dark:opacity-100" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-0">
          <FadeIn>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                <Image
                  src={`logo/${theme === 'dark' ? 'black' : 'white'}.svg`}
                  alt="Logo"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('logo.fullName')}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Full Stack Engineer
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <StaggerContainer staggerDelay={0.1}>
              <div className="flex items-center gap-3">
                {socialLinksArray.map((social) => {
                  const Icon = social.icon

                  return (
                    <StaggerItem key={social.id}>
                      <a
                        href={social.href}
                        target={social.external ? '_blank' : undefined}
                        rel={social.external ? 'noopener noreferrer' : undefined}
                        className="group flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
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

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm md:flex-row dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">
            {t('copyright', { year: currentYear })}
          </p>

          <div className="flex items-center gap-6">
            <p className="text-slate-500 dark:text-slate-400">{t('madeWith')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
