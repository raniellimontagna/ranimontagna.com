'use client'

import { Download, HamburgerMenu, CloseCircle, SquareAltArrowUp } from '@solar-icons/react/ssr'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { LanguageSwitcher, ThemeToggle } from '@/components'
import { getResumeByLocale } from '@/constants/socialLinks'
import { useCommandMenu } from '@/store/useCommandMenu/useCommandMenu'
import { useTheme } from '@/store/useTheme/useTheme'

export function Header() {
  const t = useTranslations('header')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { theme, mounted } = useTheme()
  const { setOpen: openCommandMenu } = useCommandMenu()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const resumeLink = getResumeByLocale(locale as 'en' | 'pt' | 'es')
  const isHomePage = pathname === `/${locale}` || pathname === '/'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: t('navigation.about'), href: '#about', type: 'scroll' },
    { name: t('navigation.experience'), href: '#experience', type: 'scroll' },
    { name: t('navigation.projects'), href: '#projects', type: 'scroll' },
    { name: t('navigation.blog'), href: `/${locale}/blog`, type: 'link' },
    { name: t('navigation.contact'), href: '#contact', type: 'scroll' },
  ]

  const scrollToSection = (href: string) => {
    if (!isHomePage && href.startsWith('#')) {
      router.push(`/${locale}${href}`)
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

  if (!mounted) return null

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        !isHomePage || isScrolled || isMenuOpen
          ? 'border-b border-slate-200/50 bg-white/70 py-2 shadow-sm backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/70'
          : 'bg-transparent py-4'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('#start')}
              aria-label={t('logo.ariaLabel')}
              className="group flex cursor-pointer items-center space-x-3"
            >
              <div className="relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={`logo/${theme === 'dark' ? 'white' : 'black'}.svg`}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {t('logo.fullName')}
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('logo.jobTitle')}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 xl:flex">
            <div className="flex items-center rounded-full border border-slate-200 bg-white/50 p-1 px-2 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
              {navigation.map((item) => {
                const isScrollItem = item.type === 'scroll'
                if (isScrollItem && isHomePage) {
                  return (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => scrollToSection(item.href)}
                      className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                    >
                      {item.name}
                    </button>
                  )
                }

                const href = isScrollItem ? `/${locale}${item.href}` : item.href
                return (
                  <Link
                    key={item.name}
                    href={href}
                    className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden items-center space-x-3 xl:flex">
            <button
              type="button"
              onClick={() => openCommandMenu(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 transition-all hover:border-slate-300 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-300"
            >
              <SquareAltArrowUp className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">⌘K</span>
            </button>
            <div className="flex items-center space-x-2 border-r border-slate-200 pr-4 dark:border-slate-800">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <a
              href={resumeLink.href}
              download={resumeLink.filename}
              className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-slate-800 hover:shadow-blue-500/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Download className="mr-2 h-4 w-4" />
              {resumeLink.name}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
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

        {/* Mobile Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 xl:hidden ${
            isMenuOpen
              ? 'max-h-[400px] border-t border-slate-200 pb-4 opacity-100 dark:border-slate-800'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 pt-4 pb-2">
            {navigation.map((item) => {
              const isScrollItem = item.type === 'scroll'
              if (isScrollItem && isHomePage) {
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full rounded-lg px-4 py-3 text-left font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                  >
                    {item.name}
                  </button>
                )
              }

              const href = isScrollItem ? `/${locale}${item.href}` : item.href
              return (
                <Link
                  key={item.name}
                  href={href}
                  className="block w-full rounded-lg px-4 py-3 text-left font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </header>
  )
}
