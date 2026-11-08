'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'

/**
 * Reveals an already-validated answer word by word. The server sends the whole
 * answer at once; this only paces how it appears. Without motion, or when the
 * answer is not the one being typed, it shows everything.
 */
export function useTypewriter(text: string, animate: boolean, msPerWord = 25): string {
  const [shown, setShown] = useState(() => (animate && !prefersReducedMotion() ? 0 : Infinity))

  useEffect(() => {
    if (!animate || prefersReducedMotion()) {
      setShown(Infinity)
      return
    }
    const words = Math.ceil(text.split(/(\s+)/).length / 2)
    setShown(0)
    const timer = setInterval(() => {
      setShown((count) => {
        if (count + 1 >= words) clearInterval(timer)
        return count + 1
      })
    }, msPerWord)
    return () => clearInterval(timer)
  }, [text, animate, msPerWord])

  if (shown === Infinity) return text
  const parts = text.split(/(\s+)/)
  const words = Math.ceil(parts.length / 2)
  if (shown >= words) return text
  return parts.slice(0, shown * 2).join('')
}
