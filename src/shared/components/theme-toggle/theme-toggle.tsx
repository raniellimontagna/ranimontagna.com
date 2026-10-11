'use client'

import { MoonIcon as Moon, SunIcon as Sun } from '@solar-icons/react/linear'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/shared/store/use-theme/use-theme'

/**
 * The labels only interpolate `{mode}`, so they are filled in by hand from the
 * raw message. Calling `t()` with values builds an IntlMessageFormat, and the
 * first Intl call on the page pays the cold ICU locale lookup: about 110 ms of
 * main thread on a throttled mobile CPU, right after hydration.
 */
function withMode(template: string, mode: string): string {
  return template.replaceAll('{mode}', mode)
}

export const ThemeToggle = (): React.ReactElement => {
  const t = useTranslations('header')
  const { theme, toggleTheme, mounted } = useTheme()

  const isDark = theme === 'dark'
  const nextMode = isDark ? 'light' : 'dark'

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
      aria-label={withMode(t.raw('themeToggle.ariaLabel') as string, nextMode)}
      title={withMode(t.raw('themeToggle.tooltip') as string, nextMode)}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        {isDark ? (
          <Moon className="h-5 w-5 fill-current" />
        ) : (
          <Sun className="h-5 w-5 fill-current" />
        )}
      </span>

      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 -z-10 bg-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}
