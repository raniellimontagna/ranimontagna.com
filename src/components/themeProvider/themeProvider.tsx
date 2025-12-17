'use client'

import { useTheme } from '@/store/useTheme/useTheme'
import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initTheme = useTheme((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return <>{children}</>
}
