'use client'

import { type ReactNode, useEffect, useRef } from 'react'

const HIDE_AFTER = 120
const MIN_DELTA = 4

/** Solid once the page scrolls; slides away going down and back going up. */
export function HeaderBehavior({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const header = ref.current
    if (!header) return

    let last = window.scrollY
    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      header.dataset.scrolled = y > 8 ? 'true' : 'false'
      if (Math.abs(y - last) >= MIN_DELTA) {
        header.dataset.hidden = y > last && y > HIDE_AFTER ? 'true' : 'false'
        last = y
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header
      ref={ref}
      className="fixed inset-x-0 top-0 z-40 border-b border-transparent transition-[transform,background-color,border-color] duration-300 data-[hidden=true]:-translate-y-full data-[scrolled=true]:border-line data-[scrolled=true]:bg-background"
    >
      {children}
    </header>
  )
}
