'use client'

import { CloseCircle, Download, HamburgerMenu, SquareAltArrowUp } from '@solar-icons/react/ssr'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { MagneticHover } from '@/shared/components/animations'
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

export const Header = (): React.ReactElement | null => {
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
        className={`mx-auto max-w-7xl rounded-[2rem] border px-3 py-3 transition-all duration-500 ${
          headerState === 'elevated'
            ? 'surface-panel border-[color:var(--line)] shadow-[var(--shadow-panel)]'
            : 'border-white/20 bg-white/45 shadow-[0_24px_80px_-52px_rgba(7,12,11,0.24)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6'
        }`}
      >
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-[color:var(--accent-ice)] to-transparent opacity-60" />
        <div className="flex items-center justify-between">
          <MagneticHover className="shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('#start')}
              aria-label={t('logo.ariaLabel')}
              className="group flex cursor-pointer items-center gap-3 rounded-[1.4rem] px-2 py-1.5 text-left"
            >
              <div className="surface-panel-strong relative flex h-11 w-11 items-center justify-center rounded-[1.2rem]">
                <Image
                  src="logo/black.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="h-7 w-7 dark:hidden"
                />
                <Image
                  src="logo/white.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="hidden h-7 w-7 dark:block"
                />
              </div>
              <div className="hidden min-w-0 sm:block">
                <h1 className="text-base font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                  {t('logo.fullName')}
                </h1>
                <p className="font-mono text-[0.68rem] font-medium tracking-[0.18em] text-[color:var(--muted)] uppercase">
                  {t('logo.jobTitle')}
                </p>
              </div>
            </button>
          </MagneticHover>

          <div className="hidden items-center space-x-1 xl:flex">
            <div className="surface-panel flex items-center rounded-full p-1.5">
              {navigation.map((item) =>
                renderNavigationItem(
                  item,
                  'rounded-full px-4 py-2 text-sm font-medium text-[color:var(--muted)] transition-all hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--foreground)]',
                ),
              )}
            </div>
          </div>

          <div className="hidden items-center space-x-3 xl:flex">
            <MagneticHover>
              <button
                type="button"
                onClick={() => openCommandMenu(true)}
                className="surface-panel flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-[color:var(--muted)]"
              >
                <SquareAltArrowUp className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">⌘K</span>
              </button>
            </MagneticHover>
            <div className="surface-panel flex items-center space-x-2 rounded-2xl px-2 py-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <MagneticHover>
              <a
                href={resumeLink.href}
                download={resumeLink.filename}
                className="inline-flex items-center rounded-full border border-[color:var(--line)] bg-[color:var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[color:var(--background)] shadow-[var(--shadow-soft)]"
              >
                <Download className="mr-2 h-4 w-4" />
                {resumeLink.name}
              </a>
            </MagneticHover>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <div className="surface-panel flex items-center gap-1 rounded-2xl px-2 py-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="surface-panel relative flex h-11 w-11 items-center justify-center rounded-2xl text-[color:var(--foreground)]"
              aria-label={t('mobileMenu.toggleAriaLabel')}
            >
              <HamburgerMenu
                className={`absolute h-5 w-5 transition-all duration-300 ${isMenuOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
              />
              <CloseCircle
                className={`absolute h-5 w-5 transition-all duration-300 ${isMenuOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
              />
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 xl:hidden ${
            isMenuOpen
              ? 'mt-3 max-h-100 border-t border-[color:var(--line)] pt-4 pb-2 opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1">
            {navigation.map((item) =>
              renderNavigationItem(
                item,
                'block w-full rounded-2xl px-4 py-3 text-left font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface-strong)]',
              ),
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
