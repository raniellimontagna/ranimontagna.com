'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'

/** A bunny crosses now and then: every 25–40 s, 40–60 s on phones. */
const EVERY_MS: [number, number] = [25_000, 40_000]
const PHONE_MS: [number, number] = [40_000, 60_000]
const FOOTPRINTS = 12

type Crossing = { id: number; direction: 'ltr' | 'rtl' }

function BunnyShape() {
  return (
    <svg viewBox="0 0 48 44" width="44" height="40" aria-hidden="true">
      <ellipse cx="11" cy="9" rx="3.4" ry="9" className="pascoa-bunny-ear" />
      <ellipse cx="17" cy="8" rx="3.4" ry="9" className="pascoa-bunny-ear" />
      <ellipse cx="27" cy="30" rx="15" ry="11" className="pascoa-bunny-body" />
      <circle cx="14" cy="21" r="8" className="pascoa-bunny-body" />
      <circle cx="42" cy="28" r="4" className="pascoa-bunny-tail" />
      <circle cx="11" cy="20" r="1.3" className="pascoa-bunny-eye" />
    </svg>
  )
}

/**
 * Easter's quiet visitor: a bunny hopping along the bottom edge of the screen, leaving
 * footprints that fade. Decoration only (never takes a click), and never with reduced
 * motion or in a hidden tab.
 */
export function Bunny() {
  const [crossing, setCrossing] = useState<Crossing | null>(null)
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (crossing || !visible || prefersReducedMotion()) return
    const [min, max] = window.matchMedia('(pointer: coarse)').matches ? PHONE_MS : EVERY_MS
    const timer = window.setTimeout(
      () => setCrossing({ id: Date.now(), direction: Math.random() < 0.5 ? 'ltr' : 'rtl' }),
      min + Math.random() * (max - min),
    )
    return () => window.clearTimeout(timer)
  }, [crossing, visible])

  // The strip outlives the bunny by the footprints' fade; its own end clears the stage.
  useEffect(() => {
    const strip = stripRef.current
    if (!crossing || !strip) return
    const onEnd = (event: Event) => {
      if (event.target === strip) setCrossing(null)
    }
    strip.addEventListener('animationend', onEnd)
    return () => strip.removeEventListener('animationend', onEnd)
  }, [crossing])

  if (!crossing) return null

  return (
    <div
      key={crossing.id}
      aria-hidden="true"
      data-bunny
      data-direction={crossing.direction}
      ref={stripRef}
      className="pascoa-bunny-strip"
    >
      {Array.from({ length: FOOTPRINTS }, (_, i) => (
        <span
          key={i}
          className="pascoa-footprint"
          style={{
            left: `${((i + 0.5) / FOOTPRINTS) * 100}%`,
            animationDelay: `${(i / FOOTPRINTS) * 9}s`,
          }}
        />
      ))}
      <span className="pascoa-bunny">
        <span className="pascoa-bunny-hop">
          <BunnyShape />
        </span>
      </span>
    </div>
  )
}
