'use client'

import { useEffect } from 'react'
import { useSlots } from '../shared/use-slots'
import { playWhistle } from './carnaval-sound'

const RHYTHMS = ['samba', 'frevo', 'marchinha'] as const

/**
 * The hero name dances (carnaval.css); a click on it changes the rhythm. The name's
 * click is its own, so the page-wide confetti stays out of it.
 */
export function NameRhythm() {
  const [slot] = useSlots('[data-season-slot="hero-lights"]')

  useEffect(() => {
    const title = slot?.closest('[data-hero-title]')
    if (!title) return
    let index = 0
    // The dance rests while the name is off screen (carnaval.css).
    const seen =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            title.toggleAttribute('data-season-idle', entry ? !entry.isIntersecting : false)
          })
        : null
    seen?.observe(title)
    title.setAttribute('data-ritmo', RHYTHMS[index])
    title.setAttribute('data-no-fireworks', '')
    const onClick = () => {
      index = (index + 1) % RHYTHMS.length
      title.setAttribute('data-ritmo', RHYTHMS[index])
      playWhistle()
    }
    title.addEventListener('click', onClick)
    return () => {
      title.removeEventListener('click', onClick)
      seen?.disconnect()
      title.removeAttribute('data-season-idle')
      title.removeAttribute('data-ritmo')
      title.removeAttribute('data-no-fireworks')
    }
  }, [slot])

  return null
}
