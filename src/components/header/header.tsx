'use client'

import { useEffect, useState } from 'react'
import { Menu, X, Download } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'

import { LanguageSwitcher, ThemeToggle } from '@/components'
import { getSocialLinksAsArray, getResumeByLocale } from '@/constants/socialLinks'
import { useTheme } from '@/store/useTheme/useTheme'

export function Header() {
  const t = useTranslations('header')
  const locale = useLocale()
  const { isLight, mounted } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const socialLinksArray = getSocialLinksAsArray()
  const resumeLink = getResumeByLocale(locale as 'en' | 'pt' | 'es')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: t('navigation.about'), href: '#about' },
    { name: t('navigation.experience'), href: '#experience' },
    { name: t('navigation.projects'), href: '#projects' },
    { name: t('navigation.contact'), href: '#contact' },
  ]

  const scrollToSection = (href: string) => {
    const targetId = href.substring(1)
    const element = targetId ? document.getElementById(targetId) : null
    if (href === '#start') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsMenuOpen(false)
  }

  const hasBackground = isScrolled || isMenuOpen

  if (!mounted) return null

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ease-in-out ${
        hasBackground
          ? 'border-b border-slate-200/50 bg-white/80 shadow-lg backdrop-blur-lg dark:border-slate-700/50 dark:bg-slate-900/80'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <div className="flex-shrink-0">
            <button
              onClick={() => scrollToSection('#start')}
              aria-label={t('logo.ariaLabel')}
              className="group flex cursor-pointer items-center space-x-3 transition-all duration-500 hover:scale-105"
            >
              <Image
                src={`logo/${isLight ? 'white' : 'black'}.svg`}
                alt="Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900 transition-colors duration-500 dark:text-slate-100">
                  {t('logo.fullName')}
                </h1>
                <p className="text-sm text-slate-600 transition-colors duration-500 dark:text-slate-400">
                  {t('logo.jobTitle')}
                </p>
              </div>
            </button>
          </div>

          <div className="hidden items-center space-x-8 lg:flex">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                aria-label={`Go to ${item.name} section`}
                className="group relative font-medium text-slate-700 transition-colors duration-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-slate-900 transition-all duration-500 group-hover:w-full dark:bg-slate-100"></span>
              </button>
            ))}
          </div>

          <div className="hidden items-center space-x-4 lg:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              {socialLinksArray.map((social) => {
                const IconComponent = social.icon
                return (
                  <a
                    key={social.id}
                    href={social.href}
                    target={social.external ? '_blank' : undefined}
                    rel={social.external ? 'noopener noreferrer' : undefined}
                    className="rounded-lg p-2 text-slate-600 transition-all duration-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
            <a
              href={resumeLink.href}
              download={resumeLink.filename}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-500 hover:scale-105 hover:bg-slate-800 hover:shadow-xl dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <Download className="mr-2 h-4 w-4" />
              {resumeLink.name}
            </a>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative rounded-lg p-2 text-slate-600 transition-colors duration-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              aria-label={t('mobileMenu.toggleAriaLabel')}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <Menu
                className={`h-6 w-6 transition-transform duration-500 ease-in-out ${isMenuOpen ? 'scale-0 rotate-90' : 'scale-100 rotate-0'}`}
              />
              <X
                className={`absolute top-2 left-2 h-6 w-6 transition-transform duration-500 ease-in-out ${isMenuOpen ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`}
              />
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`grid transition-all duration-500 ease-in-out lg:hidden ${isMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="overflow-hidden">
            <div className="space-y-2 border-t border-slate-200 pt-2 pb-4 dark:border-slate-700">
              {navigation.map((item, index) => (
                <button
                  aria-label={`Go to ${item.name} section`}
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full rounded-lg px-4 py-3 text-left font-medium text-slate-700 transition-all duration-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  style={{
                    transitionDelay: `${isMenuOpen ? index * 50 + 100 : 0}ms`,
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                  }}
                >
                  {item.name}
                </button>
              ))}

              <div
                className="border-t border-slate-200 pt-4 transition-all duration-500 dark:border-slate-700"
                style={{
                  transitionDelay: `${isMenuOpen ? navigation.length * 50 + 150 : 0}ms`,
                  opacity: isMenuOpen ? 1 : 0,
                }}
              >
                <div className="mb-4 flex items-center justify-center space-x-4">
                  {socialLinksArray.map((social) => {
                    const IconComponent = social.icon
                    return (
                      <a
                        key={social.id}
                        href={social.href}
                        target={social.external ? '_blank' : undefined}
                        rel={social.external ? 'noopener noreferrer' : undefined}
                        className="rounded-lg p-3 text-slate-600 transition-all duration-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        aria-label={social.name}
                      >
                        <IconComponent className="h-5 w-5" />
                      </a>
                    )
                  })}
                </div>
                <a
                  href={resumeLink.href}
                  download={resumeLink.filename}
                  className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-all duration-500 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {resumeLink.name}
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
