'use client'

import { type CSSProperties, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '@/shared/components/motion'
import { measureStrands, type Strand } from '../shared/strands'
import { useSlots } from '../shared/use-slots'
import './natal.css'

const PATTERNS = ['chase', 'twinkle', 'steady'] as const
const COLORS = ['red', 'green', 'gold'] as const
/** Bulbs about every 34 px, at least 6 a line; the wires sag 14 % of the line height. */
const LIGHTS = { spacing: 34, minCount: 6, sag: 0.14 }
const SETTLE_MS = 1400

/** A string of lights hung on the hero name; clicking the name changes the pattern. */
export function NameLights() {
  const [slot] = useSlots('[data-season-slot="hero-lights"]')
  const [still] = useState(prefersReducedMotion)
  const [index, setIndex] = useState(0)
  const [strand, setStrand] = useState<Strand | null>(null)

  useEffect(() => {
    const title = slot?.closest('[data-hero-title]')
    if (!slot || !title) return

    const update = () => setStrand(measureStrands(title, slot, LIGHTS))
    const onClick = () => setIndex((value) => (value + 1) % PATTERNS.length)
    update()
    // The letters rise in on load and the font may swap: measure again once settled.
    const settle = window.setTimeout(update, SETTLE_MS)
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null
    resize?.observe(title)
    document.fonts?.ready.then(update).catch(() => {})
    title.addEventListener('click', onClick)
    return () => {
      window.clearTimeout(settle)
      resize?.disconnect()
      title.removeEventListener('click', onClick)
    }
  }, [slot])

  if (!slot || !strand) return null
  const pattern = still ? 'steady' : PATTERNS[index]
  let bulbIndex = 0

  return createPortal(
    <span data-name-lights data-pattern={pattern} className="natal-lights">
      <svg
        className="natal-wire"
        width={strand.width}
        height={strand.height}
        viewBox={`0 0 ${strand.width || 1} ${strand.height || 1}`}
        aria-hidden="true"
      >
        {strand.wires.map((wire, line) => (
          <path key={line} d={wire.path} />
        ))}
      </svg>
      {strand.wires.flatMap((wire) =>
        wire.points.map((bulb) => {
          const i = bulbIndex++
          const style = {
            left: bulb.x,
            top: bulb.y,
            '--i': i,
            '--tilt': `${i % 2 ? 10 : -10}deg`,
            '--twinkle': `${0.9 + ((i * 37) % 10) / 10}s`,
          } as CSSProperties
          return (
            <span
              key={`${bulb.x}-${bulb.y}-${i}`}
              data-bulb
              data-up={bulb.up || undefined}
              data-color={COLORS[i % COLORS.length]}
              className="natal-bulb"
              style={style}
            />
          )
        }),
      )}
    </span>,
    slot,
  )
}
