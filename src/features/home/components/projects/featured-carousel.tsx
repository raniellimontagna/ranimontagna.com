'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

const AUTOPLAY_INTERVAL = 5000

type CarouselLabels = {
  region: string
  pause: string
  resume: string
  slide: (index: number, total: number) => string
}

type FeaturedCarouselProps = {
  images: string[]
  alt: string
  labels?: CarouselLabels
}

const DEFAULT_LABELS: CarouselLabels = {
  region: 'Image carousel',
  pause: 'Pause carousel',
  resume: 'Resume carousel',
  slide: (index, total) => `View image ${index} of ${total}`,
}

export function FeaturedCarousel({ images, alt, labels = DEFAULT_LABELS }: FeaturedCarouselProps) {
  const [active, setActive] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasFocusWithin, setHasFocusWithin] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => typeof document !== 'undefined' && document.visibilityState === 'visible',
  )
  const carouselRef = useRef<HTMLElement>(null)

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return
      setActive((index + images.length) % images.length)
    },
    [images.length],
  )

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleReducedMotion = () => {
      if (reducedMotion.matches) setUserPaused(true)
    }

    handleReducedMotion()
    reducedMotion.addEventListener?.('change', handleReducedMotion)
    return () => reducedMotion.removeEventListener?.('change', handleReducedMotion)
  }, [])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(Boolean(entry?.isIntersecting && entry.intersectionRatio > 0)),
      { threshold: 0.05 },
    )
    observer.observe(carousel)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleVisibility = () => setIsDocumentVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const autoplayPaused =
    userPaused || isHovered || hasFocusWithin || !isVisible || !isDocumentVisible

  useEffect(() => {
    if (autoplayPaused || images.length <= 1) return

    const timer = window.setInterval(() => {
      setActive((previous) => (previous + 1) % images.length)
    }, AUTOPLAY_INTERVAL)

    return () => window.clearInterval(timer)
  }, [autoplayPaused, images.length])

  if (images.length === 0) return null

  const isAdjacent = (index: number) => {
    if (images.length <= 3) return true
    const distance = Math.abs(index - active)
    return Math.min(distance, images.length - distance) <= 1
  }

  return (
    <section
      ref={carouselRef}
      aria-label={labels.region}
      className="absolute inset-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHasFocusWithin(false)
        }
      }}
    >
      {images.map((src, index) =>
        isAdjacent(index) ? (
          <div key={src} hidden={index !== active} aria-hidden={index !== active}>
            <Image
              src={src}
              alt={index === active ? (index === 0 ? alt : `${alt} — ${index + 1}`) : ''}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="object-cover object-top"
            />
          </div>
        ) : null,
      )}

      <div className="absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-black/40" />

      {images.length > 1 ? (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-xl border border-white/25 bg-slate-950/70 p-1.5 backdrop-blur-md sm:bottom-5 sm:left-5 sm:gap-2 sm:rounded-2xl sm:p-2">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(index)}
              aria-label={labels.slide(index + 1, images.length)}
              aria-pressed={index === active}
              className={`relative min-h-8 min-w-8 overflow-hidden rounded-md border transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:rounded-lg ${
                index === active
                  ? 'h-8 w-12 border-white/70 ring-1 ring-white/40 sm:h-10 sm:w-16'
                  : 'h-8 w-10 border-white/30 opacity-70 hover:opacity-100 sm:w-12'
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}

          <span className="px-1.5 font-mono text-[10px] tracking-wider text-white sm:hidden">
            {active + 1}/{images.length}
          </span>

          <button
            type="button"
            onClick={() => setUserPaused((paused) => !paused)}
            aria-label={userPaused ? labels.resume : labels.pause}
            aria-pressed={userPaused}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 text-sm font-bold text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span aria-hidden="true">{userPaused ? '▶' : 'Ⅱ'}</span>
          </button>
        </div>
      ) : null}
    </section>
  )
}
