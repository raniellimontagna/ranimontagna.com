'use client'

import { Sun, Moon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/store/useTheme/useTheme'

export function ThemeToggle() {
  const t = useTranslations('header')
  const { theme, toggleTheme, mounted } = useTheme()

  const isDark = theme === 'dark'

  if (!mounted) {
    return (
      <button
        className="rounded-lg p-2 text-slate-600 transition-all duration-300 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        disabled
        aria-label="Loading theme toggle"
      >
        <div className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative rounded-lg p-2 text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      aria-label={t('themeToggle.ariaLabel', { mode: isDark ? 'light' : 'dark' })}
      title={t('themeToggle.tooltip', { mode: isDark ? 'light' : 'dark' })}
    >
      <div className="relative h-5 w-5">
        <Sun
          className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${
            isDark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
          }`}
        />
      </div>
    </button>
  )
}
