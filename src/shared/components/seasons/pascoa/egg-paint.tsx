'use client'

import { useEffect } from 'react'
import { useSlots } from '../shared/use-slots'
import { playPloc } from './pascoa-sound'

const PAINTS = ['listras', 'bolinhas', 'zigue'] as const

/**
 * The hero letters painted like Easter eggs (pascoa.css); a click on the name repaints
 * them. The name's click is its own, so nothing else on the page answers it.
 */
export function EggPaint() {
  const [slot] = useSlots('[data-season-slot="hero-lights"]')

  useEffect(() => {
    const title = slot?.closest('[data-hero-title]')
    if (!title) return
    let index = 0
    title.setAttribute('data-pintura', PAINTS[index])
    title.setAttribute('data-no-season-click', '')
    const onClick = () => {
      index = (index + 1) % PAINTS.length
      title.setAttribute('data-pintura', PAINTS[index])
      playPloc()
    }
    title.addEventListener('click', onClick)
    return () => {
      title.removeEventListener('click', onClick)
      title.removeAttribute('data-pintura')
      title.removeAttribute('data-no-season-click')
    }
  }, [slot])

  return null
}
