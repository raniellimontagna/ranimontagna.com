'use client'

import {
  ArrowLeft,
  CloseCircle,
  Download,
  HamburgerMenu,
  SquareAltArrowUp,
} from '@solar-icons/react/ssr'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { ComponentProps } from 'react'
import { useEffect, useState } from 'react'

import { MagneticHover } from '@/shared/components/animations'
import { ColorThemePicker } from '@/shared/components/color-theme-picker/color-theme-picker'
import { LanguageSwitcher } from '@/shared/components/language-switcher/language-switcher'
import { ThemeToggle } from '@/shared/components/theme-toggle/theme-toggle'
import { getPathname, Link, usePathname } from '@/shared/config/i18n/navigation'
import { getResumeByLocale } from '@/shared/lib/social-links'
import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'

type NavigationItem = {
  name: string
  href: string
  type: 'scroll' | 'link'
}

export type HeaderProps = {
  title?: string
  backHref?: ComponentProps<typeof Link>['href']
  backLabel?: string
}

export const Header = ({
  title,
  backHref,
  backLabel,
}: HeaderProps = {}): React.ReactElement | null => {
  const t = useTranslations('header')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { setOpen: openCommandMenu } = useCommandMenu()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const resumeLink = getResumeByLocale(locale as 'en' | 'pt' | 'es')
  const isHomePage = pathname === '/'
  const homeHref = getPathname({ href: '/', locale })
  const headerState = !isHomePage || isScrolled || isMenuOpen ? 'elevated' : 'top'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation: NavigationItem[] = [
    { name: t('navigation.about'), href: '#about', type: 'scroll' },
    { name: t('navigation.experience'), href: '#experience', type: 'scroll' },
    { name: t('navigation.projects'), href: '#projects', type: 'scroll' },
    { name: t('navigation.blog'), href: '/blog', type: 'link' },
    { name: t('navigation.contact'), href: '#contact', type: 'scroll' },
  ]

  const scrollToSection = (href: string) => {
    if (!isHomePage) {
      const nextHref = href === '#start' ? homeHref : `${homeHref}${href}`
      router.push(nextHref)
      setIsMenuOpen(false)
      return
    }

    const targetId = href.substring(1)
    const element = targetId ? document.getElementById(targetId) : null
    if (href === '#start') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsMenuOpen(false)
  }

  const renderNavigationItem = (item: NavigationItem, className: string) => {
    if (item.type === 'scroll') {
      return (
        <button
          type="button"
          key={item.name}
          onClick={() => scrollToSection(item.href)}
          className={className}
        >
          {item.name}
        </button>
      )
    }

    return (
      <Link
        key={item.name}
        href={item.href}
        className={className}
        onClick={() => setIsMenuOpen(false)}
      >
        {item.name}
      </Link>
    )
  }

  return (
    <header
      data-header-state={headerState}
      className="fixed top-0 right-0 left-0 z-50 px-4 pt-4 sm:px-6 lg:px-8"
    >
      <nav
        className={`mx-auto max-w-7xl rounded-3xl border px-2 py-2 transition-all duration-500 sm:rounded-4xl sm:px-3 sm:py-3 ${
          headerState === 'elevated'
            ? 'surface-panel border-line shadow-panel'
            : 'border-white/20 bg-white/45 shadow-[0_24px_80px_-52px_rgba(7,12,11,0.24)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6'
        }`}
      >
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-accent-ice to-transparent opacity-60" />
        <div className="flex items-center justify-between">
          <div className="flex shrink-0 items-center gap-4">
            <MagneticHover className="shrink-0">
              <button
                type="button"
                onClick={() => scrollToSection('#start')}
                aria-label={t('logo.ariaLabel')}
                className="group flex cursor-pointer items-center gap-3 rounded-[1.4rem] px-2 py-1.5 text-left"
              >
                <div className="surface-panel-strong relative flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-[1.2rem]">
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
                  <h1 className="text-base font-semibold tracking-[-0.03em] text-foreground">
                    {t('logo.fullName')}
                  </h1>
                  <p className="font-mono text-[0.68rem] font-medium tracking-[0.18em] text-muted uppercase">
                    {t('logo.jobTitle')}
                  </p>
                </div>
              </button>
            </MagneticHover>
            {title && (
              <>
                <div className="hidden h-5 w-px bg-line sm:block" />
                <span className="hidden text-sm font-semibold text-foreground sm:block">
                  {title}
                </span>
              </>
            )}
          </div>

          {/* Desktop Navigation */}
          {!title && (
            <div className="hidden items-center gap-1 xl:flex">
              <div className="surface-panel flex h-10 items-center rounded-full p-1">
                {navigation.map((item) =>
                  renderNavigationItem(
                    item,
                    'flex h-8 items-center rounded-full px-4 text-sm font-medium text-muted transition-all hover:bg-surface-strong hover:text-foreground',
                  ),
                )}
              </div>
            </div>
          )}

          <div className="hidden items-center gap-3 xl:flex">
            {!title && (
              <MagneticHover>
                <button
                  type="button"
                  onClick={() => openCommandMenu(true)}
                  className="surface-panel flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm text-muted transition-all hover:bg-surface-strong"
                >
                  <SquareAltArrowUp className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">⌘K</span>
                </button>
              </MagneticHover>
            )}
            {backHref && backLabel && (
              <MagneticHover>
                <Link
                  href={backHref}
                  className="surface-panel flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium text-foreground transition-all hover:bg-surface-strong"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{backLabel}</span>
                </Link>
              </MagneticHover>
            )}
            <div className="surface-panel flex h-10 items-center gap-1 rounded-2xl p-1">
              <LanguageSwitcher />
              <ColorThemePicker />
              <ThemeToggle />
            </div>

            <MagneticHover>
              <a
                href={resumeLink.href}
                download={resumeLink.filename}
                className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-foreground px-5 text-sm font-semibold text-background shadow-soft transition-all hover:bg-foreground/90"
              >
                <Download className="mr-2 h-4 w-4" />
                {resumeLink.name}
              </a>
            </MagneticHover>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            {backHref && (
              <Link
                href={backHref}
                className="surface-panel relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-foreground transition-all hover:bg-surface-strong"
                aria-label={backLabel}
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <div className="surface-panel flex h-10 items-center gap-1 rounded-2xl p-1">
              <LanguageSwitcher />
              <ColorThemePicker />
              <ThemeToggle />
            </div>
            {!title && (
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="surface-panel relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-foreground transition-all hover:bg-surface-strong"
                aria-label={t('mobileMenu.toggleAriaLabel')}
              >
                <HamburgerMenu
                  className={`absolute h-5 w-5 transition-all duration-300 ${isMenuOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                />
                <CloseCircle
                  className={`absolute h-5 w-5 transition-all duration-300 ${isMenuOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                />
              </button>
            )}
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 xl:hidden ${
            isMenuOpen
              ? 'mt-3 max-h-100 border-t border-line pt-4 pb-2 opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1">
            {navigation.map((item) =>
              renderNavigationItem(
                item,
                'block w-full rounded-2xl px-4 py-3 text-left font-medium text-foreground hover:bg-surface-strong',
              ),
            )}

            <div className="mt-4 px-2 pb-2">
              <a
                href={resumeLink.href}
                download={resumeLink.filename}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 text-sm font-semibold text-background shadow-soft transition-all active:scale-95"
              >
                <Download className="h-4 w-4" />
                {resumeLink.name}
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
