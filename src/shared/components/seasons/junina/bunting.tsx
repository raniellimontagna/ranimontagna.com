'use client'

import { type CSSProperties, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { measureStrands, type Strand } from '../shared/strands'
import { useSlots } from '../shared/use-slots'
import { playAccordion } from './junina-sound'

/** A flag about every 30 px, at least 7, on a wire raised over the first line. */
const BUNTING = { spacing: 30, minCount: 7, sag: 0.1, top: { lift: 0.34, sagsDown: true } }
const COLORS = ['red', 'yellow', 'blue', 'green', 'fire'] as const
const SETTLE_MS = 1400
const GUST_MS = 2600

/**
 * A string of bunting over the hero name, swaying in the breeze; a click on the name
 * brings a gust. The name's click is its own, so nothing else on the page answers it.
 */
export function Bunting() {
  const [slot] = useSlots('[data-season-slot="hero-lights"]')
  const [strand, setStrand] = useState<Strand | null>(null)
  const [gust, setGust] = useState(0)

  useEffect(() => {
    const title = slot?.closest('[data-hero-title]')
    if (!slot || !title) return
    let calm = 0
    const update = () => setStrand(measureStrands(title, slot, BUNTING))
    const onClick = () => {
      setGust((value) => value + 1)
      window.clearTimeout(calm)
      calm = window.setTimeout(() => setGust(0), GUST_MS)
      playAccordion()
    }
    // The flags rest while the name is off screen (junina.css).
    const seen =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            title.toggleAttribute('data-season-idle', entry ? !entry.isIntersecting : false)
          })
        : null
    update()
    // The letters rise in on load and the font may swap: measure again once settled.
    const settle = window.setTimeout(update, SETTLE_MS)
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null
    resize?.observe(title)
    seen?.observe(title)
    document.fonts?.ready.then(update).catch(() => {})
    title.setAttribute('data-no-season-click', '')
    title.addEventListener('click', onClick)
    return () => {
      window.clearTimeout(settle)
      window.clearTimeout(calm)
      resize?.disconnect()
      seen?.disconnect()
      title.removeAttribute('data-no-season-click')
      title.removeAttribute('data-season-idle')
      title.removeEventListener('click', onClick)
    }
  }, [slot])

  const wire = strand?.wires[0]
  if (!slot || !strand || !wire) return null

  return createPortal(
    <span data-bunting data-gust={gust > 0 || undefined} className="junina-bunting">
      <svg
        className="junina-wire"
        width={strand.width}
        height={strand.height}
        viewBox={`0 0 ${strand.width || 1} ${strand.height || 1}`}
        aria-hidden="true"
      >
        <path d={wire.path} />
      </svg>
      {wire.points.map((point, i) => (
        <span
          key={`${point.x}-${point.y}`}
          data-flag
          data-color={COLORS[i % COLORS.length]}
          className="junina-flag"
          style={{ left: point.x, top: point.y, '--i': i } as CSSProperties}
        />
      ))}
    </span>,
    slot,
  )
}
