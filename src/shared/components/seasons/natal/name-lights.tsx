'use client'

import { type CSSProperties, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '@/shared/components/motion'
import { useSlots } from './use-slots'
import './natal.css'

const PATTERNS = ['chase', 'twinkle', 'steady'] as const
const COLORS = ['red', 'green', 'gold'] as const
const BULB_SPACING = 34
const MIN_BULBS = 6
/** How far the wire sags at its middle, as a share of the line height. */
const SAG = 0.14
const SETTLE_MS = 1400

type Wire = { path: string; bulbs: { x: number; y: number }[] }
type Strand = { width: number; height: number; wires: Wire[] }

/** One sagging wire under each line of the name, measured from the text itself. */
function measure(title: Element, slot: Element): Strand {
  const box = title.getBoundingClientRect()
  const lines = Array.from(title.children).filter((child) => child !== slot)
  const wires = lines.map((line) => {
    // The text's own box, not the full-width line block (jsdom has no Range rects).
    const range = document.createRange()
    range.selectNodeContents(line)
    const rect =
      typeof range.getBoundingClientRect === 'function'
        ? range.getBoundingClientRect()
        : line.getBoundingClientRect()
    const left = rect.left - box.left
    const width = rect.width
    const y = rect.bottom - box.top - rect.height * 0.04
    const sag = rect.height * SAG
    const count = Math.max(MIN_BULBS, Math.round(width / BULB_SPACING))
    const at = (t: number) => ({ x: left + t * width, y: y + sag * 4 * t * (1 - t) })
    const bulbs = Array.from({ length: count }, (_, index) => at((index + 0.5) / count))
    const mid = at(0.5)
    const path = `M ${left} ${y} Q ${mid.x} ${y + sag * 2} ${left + width} ${y}`
    return { path, bulbs }
  })
  return { width: box.width, height: box.height, wires }
}

/** A string of lights hung on the hero name; clicking the name changes the pattern. */
export function NameLights() {
  const [slot] = useSlots('[data-season-slot="hero-lights"]')
  const [still] = useState(prefersReducedMotion)
  const [index, setIndex] = useState(0)
  const [strand, setStrand] = useState<Strand | null>(null)

  useEffect(() => {
    const title = slot?.closest('[data-hero-title]')
    if (!slot || !title) return

    const update = () => setStrand(measure(title, slot))
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
        wire.bulbs.map((bulb) => {
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
