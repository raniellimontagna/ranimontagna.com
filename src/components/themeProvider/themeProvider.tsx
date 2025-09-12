'use client'

import { useEffect } from 'react'
import { useTheme } from '@/store/useTheme/useTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initTheme = useTheme((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return <>{children}</>
}
