'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Theme, ThemeStore } from './use-theme.types'

const THEME_STORAGE_KEY = 'theme-storage'
const DEFAULT_THEME: Theme = 'dark'

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (!savedTheme) {
    return DEFAULT_THEME
  }

  try {
    const parsed = JSON.parse(savedTheme)
    const theme = parsed?.state?.theme
    return theme === 'light' || theme === 'dark' ? theme : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
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
  return getThemeFromDom() ?? getStoredTheme()
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

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
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
      initTheme: () => {
        if (typeof window !== 'undefined') {
          if (get().mounted) {
            return
          }

          const initialTheme = getInitialTheme()

          set({ theme: initialTheme, mounted: true })
          applyTheme(initialTheme)
        }
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
