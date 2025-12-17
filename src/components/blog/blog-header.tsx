'use client'

import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { LanguageSwitcher, ThemeToggle } from '@/components'
import { useTheme } from '@/store/useTheme/useTheme'

export function BlogHeader() {
  const t = useTranslations('blog')
  const locale = useLocale()
  const { theme } = useTheme()

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-slate-100 bg-white py-3 shadow-sm dark:border-slate-800/50 dark:bg-slate-900/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo & Blog Brand */}
        <div className="flex items-center gap-4">
          <Link href={`/${locale}`} className="group flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <Image
                src={`/logo/${theme === 'dark' ? 'white' : 'black'}.svg`}
                alt="Logo"
                width={32}
                height={32}
              />
            </div>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />
          <Link
            href={`/${locale}/blog`}
            className="text-sm font-semibold text-slate-900 transition-colors hover:text-purple-600 dark:text-slate-100 dark:hover:text-purple-400"
          >
            Blog
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-3 w-3" />
            <span className="hidden sm:inline">{t('backToPortfolio')}</span>
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
