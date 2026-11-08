'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from '@/shared/config/i18n/navigation'
import { openVega } from '@/shared/lib/vega-events'
import { VegaMark } from '@/shared/vega/vega-mark'

const HIDE_AFTER = 120
const MIN_DELTA = 4
const END_ZONE = 80

/**
 * Vega's star dust, on every page. Focus comes back here when Vega closes.
 * It steps aside going down (same rule as the header), while the hero's own
 * "Ask Vega" button is on screen, and comes back going up or at the end.
 */
export function VegaLauncher({ label }: { label: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const button = ref.current
    if (!button || !pathname) return

    let last = window.scrollY
    let frame = 0
    let scrolledAway = false
    let ctaOnScreen = false
    let focused = false

    const apply = () => {
      button.dataset.hidden = !focused && (scrolledAway || ctaOnScreen) ? 'true' : 'false'
    }
    const update = () => {
      frame = 0
      const y = window.scrollY
      const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - END_ZONE
      if (atEnd) {
        scrolledAway = false
        last = y
      } else if (Math.abs(y - last) >= MIN_DELTA) {
        scrolledAway = y > last && y > HIDE_AFTER
        last = y
      }
      apply()
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onFocus = () => {
      focused = true
      apply()
    }
    const onBlur = () => {
      focused = false
      apply()
    }

    let observer: IntersectionObserver | undefined
    const ctas = document.querySelectorAll('[data-vega-cta]')
    if (ctas.length > 0 && typeof IntersectionObserver === 'function') {
      const visible = new Set<Element | undefined>()
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target)
          else visible.delete(entry.target)
        }
        ctaOnScreen = visible.size > 0
        apply()
      })
      for (const cta of ctas) observer.observe(cta)
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    button.addEventListener('focus', onFocus)
    button.addEventListener('blur', onBlur)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
      button.removeEventListener('focus', onFocus)
      button.removeEventListener('blur', onBlur)
    }
  }, [pathname])

  return (
    <button
      ref={ref}
      type="button"
      data-chat-launcher
      aria-label={label}
      title={label}
      onClick={openVega}
      className="fixed right-[max(1.25rem,var(--safe-right))] bottom-[max(1.25rem,var(--safe-bottom))] z-40 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-background transition-[translate,scale,opacity] duration-[250ms] hover:scale-105 active:scale-95 data-[hidden=true]:pointer-events-none data-[hidden=true]:translate-y-24 data-[hidden=true]:opacity-0 motion-reduce:data-[hidden=true]:translate-y-0"
    >
      <VegaMark size={46} density={60} />
    </button>
  )
}
