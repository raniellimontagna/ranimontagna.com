'use client'

import { type CSSProperties, type PointerEvent, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'

export const RM3D_LAYERS = 26
const RM3D_DEPTH_STEP = 1.25

const LOGO_MASK = 'url(/logo/white.svg)'
const STATIC_TRANSFORM = 'rotateY(-18deg) rotateX(8deg)'
const SHINE_PERIOD = 4.5

function masked(extra: CSSProperties): CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    maskImage: LOGO_MASK,
    WebkitMaskImage: LOGO_MASK,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    ...extra,
  }
}

/**
 * The RM mark extruded in 26 layers, with a light band sweeping its face. It
 * sways on its own and leans toward the pointer. Colors come from the theme
 * tokens; without motion it rests slightly turned, with no band.
 */
export function RmLogo3D({ size, label }: { size: number; label: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const rigRef = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    if (!prefersReducedMotion()) setMoving(true)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!moving || !root) return

    let frame = 0
    let visible = false
    const start = performance.now()

    const tick = (now: number) => {
      const t = (now - start) / 1000
      const rig = rigRef.current
      if (rig) {
        const p = pointer.current
        const rotY = p ? p.x * 50 : Math.sin(t) * 26
        const rotX = p ? -p.y * 34 : Math.cos(0.8 * t) * 10 + 6
        rig.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`
      }
      const shine = shineRef.current
      if (shine) {
        const phase = (t % SHINE_PERIOD) / SHINE_PERIOD
        shine.style.backgroundPosition = `${(120 - phase * 240).toFixed(1)}% 0`
      }
      frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(([entry]) => {
      const next = Boolean(entry?.isIntersecting)
      if (next === visible) return
      visible = next
      if (visible) frame = requestAnimationFrame(tick)
      else cancelAnimationFrame(frame)
    })
    observer.observe(root)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [moving])

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    if (!box.width || !box.height) return
    pointer.current = {
      x: (event.clientX - box.left) / box.width - 0.5,
      y: (event.clientY - box.top) / box.height - 0.5,
    }
  }

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={label}
      data-rm-logo
      data-motion={moving ? 'live' : 'static'}
      onPointerMove={moving ? onPointerMove : undefined}
      onPointerLeave={() => {
        pointer.current = null
      }}
      className="relative shrink-0"
      style={{ width: size, height: size * (984 / 999), perspective: '900px' }}
    >
      <div
        ref={rigRef}
        data-rm-rig
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', transform: STATIC_TRANSFORM }}
      >
        {Array.from({ length: RM3D_LAYERS }, (_, index) => {
          const depth = RM3D_LAYERS - index
          const mix = Math.round(62 - depth * 2.1)
          return (
            <div
              key={index}
              data-rm-layer
              style={masked({
                transform: `translateZ(${(-depth * RM3D_DEPTH_STEP).toFixed(2)}px)`,
                backgroundColor: `color-mix(in oklab, var(--foreground) ${mix}%, var(--background))`,
              })}
            />
          )
        })}
        <div data-rm-face style={masked({ backgroundColor: 'var(--foreground)' })} />
        {moving ? (
          <div
            ref={shineRef}
            data-rm-shine
            style={masked({
              backgroundImage:
                'linear-gradient(105deg, transparent 42%, color-mix(in oklab, var(--accent) 55%, transparent) 50%, transparent 58%)',
              backgroundSize: '250% 100%',
              backgroundPosition: '120% 0',
            })}
          />
        ) : null}
      </div>
    </div>
  )
}
