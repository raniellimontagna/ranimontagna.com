'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { textBox } from '../shared/text-box'
import { useSlots } from '../shared/use-slots'
import { playKey } from './programador-sound'
import { tokensBus } from './tokens-bus'

const SETTLE_MS = 1400
/** Keyword/function, string/number, all string (phosphor). The colours live in programador.css. */
const NAME_SCHEMES = 3

/**
 * The hero name highlighted like code (programador.css), with a text caret after its last
 * letter. A click on the name switches the colour scheme, letter by letter, and throws a
 * handful of tokens from there, with a key click when the sound is on; the page-wide
 * clicks stay out of it.
 */
export function HighlightName() {
  const [slot] = useSlots('[data-season-slot="hero-lights"]')
  const [spot, setSpot] = useState<{ left: number; top: number; height: number } | null>(null)

  useEffect(() => {
    const title = slot?.closest('[data-hero-title]')
    if (!slot || !title) return

    let scheme = 0
    const update = () => {
      const lines = Array.from(title.children).filter((child) => child !== slot)
      const last = lines.at(-1)
      if (!last) return
      const box = title.getBoundingClientRect()
      const line = textBox(last)
      setSpot({ left: line.right - box.left, top: line.top - box.top, height: line.height })
    }
    const onClick = (event: Event) => {
      const { clientX, clientY } = event as MouseEvent
      scheme = (scheme + 1) % NAME_SCHEMES
      title.setAttribute('data-scheme', String(scheme))
      const box = title.getBoundingClientRect()
      tokensBus.burstAt(clientX || box.left + box.width / 2, clientY || box.top)
      playKey()
    }
    // The caret rests while the name is off screen (programador.css).
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
    title.setAttribute('data-scheme', '0')
    title.setAttribute('data-no-season-click', '')
    title.addEventListener('click', onClick)
    return () => {
      window.clearTimeout(settle)
      resize?.disconnect()
      seen?.disconnect()
      title.removeAttribute('data-scheme')
      title.removeAttribute('data-no-season-click')
      title.removeAttribute('data-season-idle')
      title.removeEventListener('click', onClick)
    }
  }, [slot])

  if (!slot || !spot) return null

  return createPortal(
    <span
      data-caret
      className="programador-caret"
      style={{ left: spot.left, top: spot.top, height: spot.height }}
    />,
    slot,
  )
}
