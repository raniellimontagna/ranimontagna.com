'use client'

import { getImageProps } from 'next/image'
import { useEffect, useRef } from 'react'
import { preload } from 'react-dom'
import { loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'
import { copiesOf } from '@/shared/lib/image-copies/image-copies'

type PhotoRevealProps = {
  alt: string
  effect: 'mask' | 'scale' | 'parallax'
  sizes: string
  priority?: boolean
  className?: string
} & (
  | {
      /** A site image listed in image-copies/copies.json: served from its static copies. */
      master: string
      src?: never
    }
  | {
      /** Any other image (a blog cover from the media host): through the optimizer. */
      src: string
      master?: never
    }
)

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
  master,
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

  if (master) {
    const copies = copiesOf(master)
    if (priority) {
      preload(copies.src, {
        as: 'image',
        type: 'image/avif',
        imageSrcSet: copies.avif,
        imageSizes: sizes,
        fetchPriority: 'high',
      })
    }
    return (
      <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
        <picture>
          <source type="image/avif" srcSet={copies.avif} sizes={sizes} />
          <img
            ref={imgRef}
            src={copies.src}
            srcSet={copies.webp}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      </div>
    )
  }

  const { props } = getImageProps({
    src: src as string,
    alt,
    fill: true,
    sizes,
    priority,
    // getImageProps leaves fetchPriority unset: an LCP picture asks for it.
    fetchPriority: priority ? 'high' : undefined,
  })

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
      {/* biome-ignore lint/performance/noImgElement: the scroll animation drives this exact element. */}
      <img {...props} ref={imgRef} alt={alt} className="object-cover" />
    </div>
  )
}
