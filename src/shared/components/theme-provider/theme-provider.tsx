'use client'

import { useEffect } from 'react'
import { useTheme } from '@/shared/store/use-theme/use-theme'

const applyThemeToDom = (theme: 'light' | 'dark') => {
  const html = document.documentElement
  html.classList.remove('light', 'dark')
  html.classList.add(theme)
  html.style.colorScheme = theme
}

const applyColorThemeToDom = (colorTheme: string) => {
  const html = document.documentElement
  if (colorTheme === 'default') {
    html.removeAttribute('data-color-theme')
  } else {
    html.setAttribute('data-color-theme', colorTheme)
  }
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const initTheme = useTheme((state) => state.initTheme)
  const theme = useTheme((state) => state.theme)
  const colorTheme = useTheme((state) => state.colorTheme)
  const mounted = useTheme((state) => state.mounted)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  // Re-apply theme to DOM on every mount (e.g. after locale navigation)
  // This ensures the server-rendered className="dark" gets corrected
  useEffect(() => {
    if (mounted) {
      applyThemeToDom(theme)
      applyColorThemeToDom(colorTheme)
    }
  }, [mounted, theme, colorTheme])

  return <>{children}</>
}
