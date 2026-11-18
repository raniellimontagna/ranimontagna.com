import { textBox } from './text-box'

export type StrandPoint = { x: number; y: number; up: boolean }
export type Wire = { path: string; points: StrandPoint[] }
export type Strand = { width: number; height: number; wires: Wire[] }

type StrandOptions = {
  /** Pixels between two things hung on the wire. */
  spacing: number
  minCount: number
  /** How far the wire sags at its middle, as a share of the line height. */
  sag: number
  /** The wire over the first line: raised by this share of the line height, sagging down
   *  (bunting hangs from it) instead of arching up (bulbs stand on it). */
  top?: { lift: number; sagsDown: boolean }
}

/**
 * Two wires measured from the hero name's text itself: one over the first line, one
 * under the last. Between the lines there is no room (tight leading). Christmas hangs
 * lights on them; the Festa Junina hangs bunting.
 */
export function measureStrands(title: Element, slot: Element, options: StrandOptions): Strand {
  const box = title.getBoundingClientRect()
  const lines = Array.from(title.children).filter((child) => child !== slot)
  const first = lines[0]
  const last = lines.at(-1)
  if (!first || !last) return { width: box.width, height: box.height, wires: [] }

  const strand = (line: Element, up: boolean): Wire => {
    const rect = textBox(line)
    const left = rect.left - box.left
    const width = rect.width
    const lift = up ? (options.top?.lift ?? 0) * rect.height : 0
    const y = up ? rect.top - box.top + rect.height * 0.04 - lift : rect.bottom - box.top
    const down = up ? (options.top?.sagsDown ?? false) : true
    const sag = rect.height * options.sag * (down ? 1 : -1)
    const count = Math.max(options.minCount, Math.round(width / options.spacing))
    const at = (t: number) => ({ x: left + t * width, y: y + sag * 4 * t * (1 - t), up })
    const points = Array.from({ length: count }, (_, index) => at((index + 0.5) / count))
    const path = `M ${left} ${y} Q ${left + width / 2} ${y + sag * 2} ${left + width} ${y}`
    return { path, points }
  }

  return { width: box.width, height: box.height, wires: [strand(first, true), strand(last, false)] }
}
