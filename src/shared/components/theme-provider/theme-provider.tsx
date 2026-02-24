'use client'

import { useEffect } from 'react'
import { useTheme } from '@/shared/store/use-theme/use-theme'

export const ThemeProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const initTheme = useTheme((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return <>{children}</>
}
