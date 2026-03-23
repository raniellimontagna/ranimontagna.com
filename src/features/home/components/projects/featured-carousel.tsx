'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

const AUTOPLAY_INTERVAL = 5000

type FeaturedCarouselProps = {
  images: string[]
  alt: string
}

export function FeaturedCarousel({ images, alt }: FeaturedCarouselProps) {
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback(
    (index: number) => {
      setActive((index + images.length) % images.length)
    },
    [images.length],
  )

  useEffect(() => {
    if (isPaused || images.length <= 1) return

    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length)
    }, AUTOPLAY_INTERVAL)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, images.length])

  if (images.length === 0) return null

  return (
    <section
      aria-label="Image carousel"
      className="absolute inset-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? alt : `${alt} — ${i + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          className={`object-cover object-top transition-opacity duration-700 ease-in-out ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
          priority={i === 0}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-black/40" />

      {/* Thumbnails — bottom left */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-950/50 p-1.5 backdrop-blur-md sm:bottom-5 sm:left-5 sm:gap-2 sm:rounded-2xl sm:p-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver imagem ${i + 1}`}
              className={`relative overflow-hidden rounded-md border transition-all duration-300 sm:rounded-lg ${
                i === active
                  ? 'h-8 w-12 border-white/60 ring-1 ring-white/30 sm:h-10 sm:w-16'
                  : 'h-7 w-10 border-white/15 opacity-50 hover:opacity-85 sm:h-8 sm:w-12'
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}

          {/* Counter — mobile only */}
          <span className="px-1.5 font-mono text-[10px] tracking-wider text-white/70 sm:hidden">
            {active + 1}/{images.length}
          </span>
        </div>
      )}
    </section>
  )
}
