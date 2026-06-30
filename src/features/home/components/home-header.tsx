import { Download } from '@solar-icons/react/ssr'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/shared/config/i18n/navigation'
import { getResumeByLocale } from '@/shared/lib/social-links'
import { HomeHeaderControls } from './home-header-controls'

type HomeHeaderProps = {
  locale: 'en' | 'pt' | 'es'
}

export async function HomeHeader({ locale }: HomeHeaderProps) {
  const t = await getTranslations('header')
  const resumeLink = getResumeByLocale(locale)
  const navigation = [
    { name: t('navigation.about'), href: '#about' },
    { name: t('navigation.experience'), href: '#experience' },
    { name: t('navigation.projects'), href: '#projects' },
    { name: t('navigation.contact'), href: '#contact' },
  ]

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="mx-auto max-w-7xl rounded-3xl border border-white/20 bg-white/45 px-2 py-2 shadow-[0_24px_80px_-52px_rgba(7,12,11,0.24)] backdrop-blur-2xl sm:rounded-4xl sm:px-3 sm:py-3 dark:border-white/10 dark:bg-white/6">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-accent-ice to-transparent opacity-60" />
        <div className="flex items-center justify-between gap-3">
          <a href="#start" className="group flex min-w-0 items-center gap-3 rounded-[1.4rem] px-2 py-1.5">
            <div className="surface-panel-strong relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-[1.2rem]">
              <Image
                src="/logo/black.svg"
                alt="Logo"
                width={28}
                height={28}
                className="h-6 w-6 block sm:h-7 sm:w-7 dark:hidden"
              />
              <Image
                src="/logo/white.svg"
                alt="Logo"
                width={28}
                height={28}
                className="hidden h-6 w-6 sm:h-7 sm:w-7 dark:block"
              />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="text-base font-semibold tracking-[-0.03em] text-foreground">
                {t('logo.fullName')}
              </p>
              <p className="font-mono text-[0.68rem] font-medium tracking-[0.18em] text-muted uppercase">
                {t('logo.jobTitle')}
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-1 xl:flex">
            <div className="surface-panel flex h-10 items-center rounded-full p-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex h-8 items-center rounded-full px-4 text-sm font-medium text-muted transition-all hover:bg-surface-strong hover:text-foreground"
                >
                  {item.name}
                </a>
              ))}
              <Link
                href="/blog"
                prefetch={false}
                className="flex h-8 items-center rounded-full px-4 text-sm font-medium text-muted transition-all hover:bg-surface-strong hover:text-foreground"
              >
                {t('navigation.blog')}
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <HomeHeaderControls />
            <a
              href={resumeLink.href}
              download={resumeLink.filename}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-line bg-foreground px-4 text-sm font-semibold text-background shadow-soft transition-all hover:bg-foreground/90 sm:px-5"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{resumeLink.name}</span>
              <span className="sm:hidden">CV</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}
