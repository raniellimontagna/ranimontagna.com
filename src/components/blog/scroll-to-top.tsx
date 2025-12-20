'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ScrollToTopProps {
  /**
   * The scroll threshold in pixels after which the button appears
   * @default 400
   */
  threshold?: number
  /**
   * Whether to show the button
   * @default true
   */
  enabled?: boolean
}

export function ScrollToTop({ threshold = 400, enabled = true }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const toggleVisibility = () => {
      // Show button when page is scrolled down past threshold
      if (window.scrollY > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Add scroll event listener
    window.addEventListener('scroll', toggleVisibility, { passive: true })

    // Check initial scroll position
    toggleVisibility()

    // Cleanup
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [threshold, enabled])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!enabled) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className={`
        fixed bottom-8 right-8 z-40
        flex h-12 w-12 items-center justify-center
        rounded-full
        bg-slate-900 text-white
        shadow-lg shadow-slate-900/20
        transition-all duration-300 ease-out
        hover:scale-110 hover:shadow-xl hover:shadow-slate-900/30
        focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
        dark:bg-slate-100 dark:text-slate-900
        dark:shadow-slate-100/20
        dark:hover:shadow-slate-100/30
        dark:focus:ring-slate-100
        ${
          isVisible
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        }
      `}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  )
}

