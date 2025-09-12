'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Theme, ThemeStore } from './useTheme.types'

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
    console.log('DOM classes after apply:', html.classList.toString())
  }
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      mounted: false,
      setTheme: (theme: Theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        console.log('Toggle theme from', theme, 'to', newTheme)
        set({ theme: newTheme })
        applyTheme(newTheme)
      },
      initTheme: () => {
        if (typeof window !== 'undefined') {
          if (get().mounted) {
            return
          }

          const savedTheme = localStorage.getItem('theme-storage')
          let initialTheme: Theme = 'dark'

          if (savedTheme) {
            try {
              const parsed = JSON.parse(savedTheme)
              initialTheme = parsed.state?.theme || 'dark'
            } catch {
              initialTheme = 'dark'
            }
          } else {
            initialTheme = 'dark'
          }

          set({ theme: initialTheme, mounted: true })
          applyTheme(initialTheme)
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
