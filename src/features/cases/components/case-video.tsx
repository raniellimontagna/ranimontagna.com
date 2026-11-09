'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'

type CaseVideoProps = {
  src: string
  /** Plays only while this media query matches (a desktop screen on a phone stays still). */
  query?: string
  /** Someone else plays and pauses it (the tour, by its active step). */
  managed?: boolean
}

/**
 * A short screen recording of the product, muted and looping, laid over its
 * own first frame (an optimized still the caller renders underneath, which
 * carries the alt and is what loads first). It downloads nothing until it
 * plays, stays invisible until then, and plays only while on screen; with
 * reduced motion, or before the script runs, the still stands in.
 */
export function CaseVideo({ src, query, managed }: CaseVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const started = () => {
      video.dataset.started = 'true'
    }
    video.addEventListener('playing', started)
    return () => video.removeEventListener('playing', started)
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!video || managed || prefersReducedMotion()) return
    if (query && !window.matchMedia(query).matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.25 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [managed, query])

  return (
    <video
      ref={ref}
      src={src}
      aria-hidden="true"
      muted
      loop
      playsInline
      preload="none"
      data-case-video
      className="absolute inset-0 h-full w-full object-cover opacity-0 data-[started=true]:opacity-100"
    />
  )
}
