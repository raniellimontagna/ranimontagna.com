'use client'

import { getImageProps } from 'next/image'
import { useEffect, useRef } from 'react'
import { loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'

type PhotoRevealProps = {
  src: string
  alt: string
  effect: 'mask' | 'scale' | 'parallax'
  sizes: string
  priority?: boolean
  className?: string
}

const FROM = {
  mask: { clipPath: 'inset(12% 18% 12% 18%)' },
  scale: { scale: 1.2 },
  parallax: { yPercent: -12 },
} as const

const TO = {
  mask: { clipPath: 'inset(0% 0% 0% 0%)' },
  scale: { scale: 1 },
  parallax: { yPercent: 12 },
} as const

/**
 * A real photo that opens, settles or drifts with the scroll. The image is
 * whole and visible until the motion loads, and stays that way without it.
 */
export function PhotoReveal({
  src,
  alt,
  effect,
  sizes,
  priority,
  className = '',
}: PhotoRevealProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const frame = frameRef.current
    const img = imgRef.current
    if (!frame || !img || prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | undefined

    loadScrollMotion().then(({ gsap }) => {
      if (cancelled) return
      const context = gsap.context(() => {
        gsap.fromTo(img, FROM[effect], {
          ...TO[effect],
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      }, frame)
      revert = () => context.revert()
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [effect])

  const { props } = getImageProps({ src, alt, fill: true, sizes, priority })

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
      {/* biome-ignore lint/performance/noImgElement: the scroll animation drives this exact element. */}
      <img {...props} ref={imgRef} alt={alt} className="object-cover" />
    </div>
  )
}
