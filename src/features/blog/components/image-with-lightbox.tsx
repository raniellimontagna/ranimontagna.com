'use client'

import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface ImageWithLightboxProps {
  src?: string
  alt?: string
}

export function ImageWithLightbox({ src, alt }: ImageWithLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!src) return null

  return (
    <>
      <span className="my-8 block">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 shadow-lg transition-all hover:shadow-xl dark:border-slate-800"
          aria-label={`View larger: ${alt || 'Image'}`}
        >
          {/* biome-ignore lint/performance/noImgElement: next/image cannot be used with MDX dynamic props */}
          <img
            src={src}
            alt={alt}
            className="w-full transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Zoom indicator overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100">
            <div className="rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm dark:bg-slate-900/90">
              <svg
                className="h-6 w-6 text-slate-700 dark:text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Zoom in</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>
          </div>
        </button>
        {alt && (
          <span className="mt-3 block text-center text-sm italic text-slate-500 dark:text-slate-400">
            {alt}
          </span>
        )}
      </span>

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={[{ src, alt: alt || 'Image' }]}
        carousel={{ finite: true }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
        }}
      />
    </>
  )
}
