'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'

type Typed = { text: string; done: boolean }

function wordCount(text: string): number {
  return Math.ceil(text.split(/(\s+)/).length / 2)
}

/**
 * Reveals an already-validated answer word by word. The server sends the whole
 * answer at once; this only paces how it appears. Without motion, or when the
 * answer is not the one being typed, it shows everything. It restarts in the
 * same render that animation turns on, so there is never a stale "done" frame.
 */
export function useTypewriter(text: string, animate: boolean, msPerWord = 25): Typed {
  const instant = !animate || prefersReducedMotion()
  const key = `${instant ? 'instant' : 'typing'}|${text}`
  const [state, setState] = useState({ key, shown: instant ? Number.POSITIVE_INFINITY : 0 })
  const current = state.key === key ? state : { key, shown: instant ? Number.POSITIVE_INFINITY : 0 }
  if (state.key !== key) setState(current)

  useEffect(() => {
    if (instant) return
    const words = wordCount(text)
    const timer = setInterval(() => {
      setState((previous) => {
        if (previous.key !== key) return previous
        if (previous.shown + 1 >= words) clearInterval(timer)
        return { key, shown: previous.shown + 1 }
      })
    }, msPerWord)
    return () => clearInterval(timer)
  }, [instant, key, text, msPerWord])

  const words = wordCount(text)
  if (current.shown >= words) return { text, done: true }
  return {
    text: text
      .split(/(\s+)/)
      .slice(0, current.shown * 2)
      .join(''),
    done: false,
  }
}
