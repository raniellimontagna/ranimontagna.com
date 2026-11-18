'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { textBox } from '../shared/text-box'
import { useSlots } from '../shared/use-slots'
import { fireworksBus } from './fireworks-bus'

const SETTLE_MS = 1400

type Spot = { left: number; top: number }

/** The digits both years share, and the part that rolls (2029 → 2030 rolls "29" to "30"). */
export function splitYears(from: number, to: number) {
  const a = String(from)
  const b = String(to)
  let same = 0
  while (same < a.length && a[same] === b[same]) same++
  return { shared: a.slice(0, same), before: a.slice(same), after: b.slice(same) }
}

/**
 * A small year beside the name whose last digit rolls into the next year at the
 * virada. Clicking the name sends a firework up from it.
 */
export function YearCounter({ edition, turned }: { edition: number; turned: boolean }) {
  const [slot] = useSlots('[data-season-slot="hero-lights"]')
  const [spot, setSpot] = useState<Spot | null>(null)

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
      const box = title.getBoundingClientRect()
      const { clientX, clientY } = event as MouseEvent
      fireworksBus.launchAt(
        box.left + box.width * (0.2 + Math.random() * 0.6),
        Math.max(40, box.top - 60 - Math.random() * 140),
        { x: clientX || box.left + box.width / 2, y: clientY || box.top },
      )
    }
    update()
    // The letters rise in on load and the font may swap: measure again once settled.
    const settle = window.setTimeout(update, SETTLE_MS)
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null
    resize?.observe(title)
    document.fonts?.ready.then(update).catch(() => {})
    // The glint rests while the name is off screen (reveillon.css).
    const seen =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            title.toggleAttribute('data-season-idle', entry ? !entry.isIntersecting : false)
          })
        : null
    seen?.observe(title)
    // The name sends its own firework; the page-wide click should not add a second one.
    title.setAttribute('data-no-season-click', '')
    title.addEventListener('click', onClick)
    return () => {
      window.clearTimeout(settle)
      resize?.disconnect()
      seen?.disconnect()
      title.removeAttribute('data-season-idle')
      title.removeAttribute('data-no-season-click')
      title.removeEventListener('click', onClick)
    }
  }, [slot])

  if (!slot || !spot) return null
  const { shared, before, after } = splitYears(edition, edition + 1)

  return createPortal(
    <span
      data-year-counter
      data-turned={turned || undefined}
      className="reveillon-year"
      style={{ left: spot.left, top: spot.top }}
    >
      <span>{shared}</span>
      <span className="reveillon-year-roll">
        <span>{before}</span>
        <span>{after}</span>
      </span>
    </span>,
    slot,
  )
}
