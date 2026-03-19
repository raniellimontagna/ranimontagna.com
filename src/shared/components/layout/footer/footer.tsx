import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { FadeIn, StaggerContainer, StaggerItem } from '@/shared/components/animations'
import type { SocialLink } from '@/shared/lib/social-links'
import { getSocialLinksAsArray } from '@/shared/lib/social-links'

export const Footer = (): React.ReactElement => {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear()
  const socialLinksArray = getSocialLinksAsArray().map((social) =>
    social.id === 'email' && social.direct
      ? { ...social, href: `mailto:${social.direct}` }
      : social,
  )

  return (
    <footer className="relative border-t border-line bg-background pt-16 pb-8">
      <div className="absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-accent to-transparent opacity-50 dark:opacity-100" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-0">
          <FadeIn>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                <Image
                  src="logo/white.svg"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="dark:hidden"
                />
                <Image
                  src="logo/black.svg"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="hidden dark:block"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t('logo.fullName')}</h3>
                <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted">
                  Full Stack Engineer
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <StaggerContainer staggerDelay={0.1}>
              <div className="flex items-center gap-3">
                {socialLinksArray.map((social: SocialLink & { id: string }) => {
                  const Icon = social.icon

                  return (
                    <StaggerItem key={social.id}>
                      <a
                        href={social.href}
                        target={social.external ? '_blank' : undefined}
                        rel={social.external ? 'noopener noreferrer' : undefined}
                        className="group flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:text-foreground"
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

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-line pt-8 text-sm md:flex-row">
          <p className="text-muted">{t('copyright', { year: currentYear })}</p>

          <div className="flex items-center gap-6">
            <p className="text-muted">{t('madeWith')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
