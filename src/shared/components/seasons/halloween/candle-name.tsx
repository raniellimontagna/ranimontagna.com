'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { textBox } from '../shared/text-box'
import { useSlots } from '../shared/use-slots'
import { batsBus } from './bats-bus'
import { playCackle } from './halloween-sound'

const SETTLE_MS = 1400

/**
 * The hero name lit by candlelight (halloween.css), with a little cobweb at the end of
 * its first line. A click on the name lets a bat out of it, with a cackle when the sound
 * is on; the page-wide clicks stay out of it.
 */
export function CandleName() {
  const [slot] = useSlots('[data-season-slot="hero-lights"]')
  const [spot, setSpot] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    const title = slot?.closest('[data-hero-title]')
    if (!slot || !title) return

    const update = () => {
      const first = Array.from(title.children).find((child) => child !== slot)
      if (!first) return
      const box = title.getBoundingClientRect()
      const line = textBox(first)
      setSpot({ left: line.right - box.left, top: line.top - box.top })
    }
    const onClick = (event: Event) => {
      const { clientX, clientY } = event as MouseEvent
      const box = title.getBoundingClientRect()
      batsBus.flyFrom(clientX || box.left + box.width / 2, clientY || box.top)
      playCackle()
    }
    // The flicker rests while the name is off screen (halloween.css).
    const seen =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            title.toggleAttribute('data-season-idle', entry ? !entry.isIntersecting : false)
          })
        : null
    update()
    const settle = window.setTimeout(update, SETTLE_MS)
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null
    resize?.observe(title)
    seen?.observe(title)
    document.fonts?.ready.then(update).catch(() => {})
    title.setAttribute('data-no-season-click', '')
    title.addEventListener('click', onClick)
    return () => {
      window.clearTimeout(settle)
      resize?.disconnect()
      seen?.disconnect()
      title.removeAttribute('data-no-season-click')
      title.removeAttribute('data-season-idle')
      title.removeEventListener('click', onClick)
    }
  }, [slot])

  if (!slot || !spot) return null

  return createPortal(
    <span data-cobweb className="halloween-web" style={{ left: spot.left, top: spot.top }}>
      <svg viewBox="0 0 60 60" aria-hidden="true">
        <g className="halloween-web-threads">
          <path d="M0 0L60 60M0 0L60 22M0 0L22 60M0 0L60 0M0 0L0 60" />
          <path d="M12 0Q11 11 0 12M24 0Q22 22 0 24M38 0Q34 34 0 38M54 0Q48 48 0 54" />
        </g>
        <path d="M40 40V52" className="halloween-web-thread" />
        <g className="halloween-web-spider">
          <ellipse cx="40" cy="55" rx="3.2" ry="3.8" />
          <path d="M37 53l-4-2M37 56l-4 1M43 53l4-2M43 56l4 1" />
        </g>
      </svg>
    </span>,
    slot,
  )
}
