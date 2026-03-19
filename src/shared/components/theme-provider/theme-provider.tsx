'use client'

import { useEffect } from 'react'
import { useTheme } from '@/shared/store/use-theme/use-theme'

const applyThemeToDom = (theme: 'light' | 'dark') => {
  const html = document.documentElement
  html.classList.remove('light', 'dark')
  html.classList.add(theme)
  html.style.colorScheme = theme
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const initTheme = useTheme((state) => state.initTheme)
  const theme = useTheme((state) => state.theme)
  const mounted = useTheme((state) => state.mounted)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  // Re-apply theme to DOM on every mount (e.g. after locale navigation)
  // This ensures the server-rendered className="dark" gets corrected
  useEffect(() => {
    if (mounted) {
      applyThemeToDom(theme)
    }
  }, [mounted, theme])

  return <>{children}</>
}
