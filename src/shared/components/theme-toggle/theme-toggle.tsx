'use client'

import { Moon, Sun } from '@solar-icons/react/ssr'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/shared/store/use-theme/use-theme'

export const ThemeToggle = (): React.ReactElement => {
  const t = useTranslations('header')
  const { theme, toggleTheme, mounted } = useTheme()

  const isDark = theme === 'dark'

  if (!mounted) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-strong/50 opacity-20" />
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl text-muted transition-all duration-300 hover:bg-surface-strong hover:text-accent-strong active:scale-90"
      aria-label={t('themeToggle.ariaLabel', { mode: isDark ? 'light' : 'dark' })}
      title={t('themeToggle.tooltip', { mode: isDark ? 'light' : 'dark' })}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.3, ease: 'backOut' }}
          className="relative flex h-5 w-5 items-center justify-center"
        >
          {isDark ? (
            <Moon className="h-5 w-5 fill-current" />
          ) : (
            <Sun className="h-5 w-5 fill-current" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 -z-10 bg-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}
