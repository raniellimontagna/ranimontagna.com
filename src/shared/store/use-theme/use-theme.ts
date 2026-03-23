'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ColorTheme, Theme, ThemeStore } from './use-theme.types'

const THEME_STORAGE_KEY = 'theme-storage'
const DEFAULT_THEME: Theme = 'dark'
const DEFAULT_COLOR_THEME: ColorTheme = 'default'

const getStoredTheme = (): { theme: Theme; colorTheme: ColorTheme } => {
  if (typeof window === 'undefined') {
    return { theme: DEFAULT_THEME, colorTheme: DEFAULT_COLOR_THEME }
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (!savedTheme) {
    return { theme: DEFAULT_THEME, colorTheme: DEFAULT_COLOR_THEME }
  }

  try {
    const parsed = JSON.parse(savedTheme)
    const theme = parsed?.state?.theme
    const colorTheme = parsed?.state?.colorTheme
    return {
      theme: theme === 'light' || theme === 'dark' ? theme : DEFAULT_THEME,
      colorTheme: isValidColorTheme(colorTheme) ? colorTheme : DEFAULT_COLOR_THEME,
    }
  } catch {
    return { theme: DEFAULT_THEME, colorTheme: DEFAULT_COLOR_THEME }
  }
}

const isValidColorTheme = (value: unknown): value is ColorTheme => {
  return (
    typeof value === 'string' &&
    ['default', 'ocean', 'rose', 'emerald', 'amber', 'violet', 'mono', 'sunset', 'cherry'].includes(
      value,
    )
  )
}

const getThemeFromDom = (): Theme | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const html = document.documentElement
  if (html.classList.contains('light')) {
    return 'light'
  }

  if (html.classList.contains('dark')) {
    return 'dark'
  }

  return null
}

const getInitialTheme = (): Theme => {
  return getThemeFromDom() ?? getStoredTheme().theme
}

const applyTheme = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.remove('light')
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
    }
    html.style.colorScheme = theme
  }
}

const applyColorTheme = (colorTheme: ColorTheme) => {
  if (typeof document !== 'undefined') {
    const html = document.documentElement
    if (colorTheme === 'default') {
      html.removeAttribute('data-color-theme')
    } else {
      html.setAttribute('data-color-theme', colorTheme)
    }
  }
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      colorTheme: getStoredTheme().colorTheme,
      mounted: false,
      setTheme: (theme: Theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        applyTheme(newTheme)
      },
      setColorTheme: (colorTheme: ColorTheme) => {
        set({ colorTheme })
        applyColorTheme(colorTheme)
      },
      initTheme: () => {
        if (typeof window !== 'undefined') {
          if (get().mounted) {
            return
          }

          const initialTheme = getInitialTheme()
          const { colorTheme } = getStoredTheme()

          set({ theme: initialTheme, colorTheme, mounted: true })
          applyTheme(initialTheme)
          applyColorTheme(colorTheme)
        }
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme, colorTheme: state.colorTheme }),
    },
  ),
)
