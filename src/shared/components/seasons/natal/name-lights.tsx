'use client'

import { type CSSProperties, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '@/shared/components/motion'
import { textBox } from '../shared/text-box'
import { useSlots } from '../shared/use-slots'
import './natal.css'

const PATTERNS = ['chase', 'twinkle', 'steady'] as const
const COLORS = ['red', 'green', 'gold'] as const
const BULB_SPACING = 34
const MIN_BULBS = 6
/** How far the wire sags at its middle, as a share of the line height. */
const SAG = 0.14
const SETTLE_MS = 1400

type Bulb = { x: number; y: number; up: boolean }
type Wire = { path: string; bulbs: Bulb[] }
type Strand = { width: number; height: number; wires: Wire[] }

/**
 * Frames the name with two strands, measured from the text itself: one arching
 * over the first line with bulbs standing up, one sagging under the last with
 * bulbs hanging down. Between the lines there is no room (tight leading).
 */
function measure(title: Element, slot: Element): Strand {
  const box = title.getBoundingClientRect()
  const lines = Array.from(title.children).filter((child) => child !== slot)
  const first = lines[0]
  const last = lines.at(-1)
  if (!first || !last) return { width: box.width, height: box.height, wires: [] }

  const strand = (line: Element, up: boolean): Wire => {
    const rect = textBox(line)
    const left = rect.left - box.left
    const width = rect.width
    const y = up ? rect.top - box.top + rect.height * 0.04 : rect.bottom - box.top
    const sag = rect.height * SAG * (up ? -1 : 1)
    const count = Math.max(MIN_BULBS, Math.round(width / BULB_SPACING))
    const at = (t: number) => ({ x: left + t * width, y: y + sag * 4 * t * (1 - t), up })
    const bulbs = Array.from({ length: count }, (_, index) => at((index + 0.5) / count))
    const path = `M ${left} ${y} Q ${left + width / 2} ${y + sag * 2} ${left + width} ${y}`
    return { path, bulbs }
  }

  return { width: box.width, height: box.height, wires: [strand(first, true), strand(last, false)] }
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
