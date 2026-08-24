'use client'

import { useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { type ComponentType, useRef, useState } from 'react'
import type Lightbox from 'yet-another-react-lightbox'
import { resolveBlogMediaUrl } from '@/features/blog/lib/media'
import { SafeImage } from './safe-image'

type LightboxComponent = typeof Lightbox
type LightboxLoader = () => Promise<LightboxComponent>

const loadDefaultLightbox: LightboxLoader = async () => {
  await import('yet-another-react-lightbox/styles.css')
  return (await import('yet-another-react-lightbox')).default
}

interface ImageWithLightboxProps {
  src?: string
  alt?: string
  loadLightbox?: LightboxLoader
}

export function ImageWithLightbox({
  src,
  alt,
  loadLightbox = loadDefaultLightbox,
}: ImageWithLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [Viewer, setViewer] = useState<ComponentType<
    React.ComponentProps<LightboxComponent>
  > | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const t = useTranslations('blog')
  const resolvedSrc = resolveBlogMediaUrl(src)
  const imageAlt = alt || t('image')

  if (!resolvedSrc) return null

  const openViewer = async () => {
    setLoadFailed(false)
    if (Viewer) {
      setIsOpen(true)
      return
    }

    setIsLoading(true)
    try {
      const LoadedViewer = await loadLightbox()
      setViewer(() => LoadedViewer)
      setIsOpen(true)
    } catch {
      setLoadFailed(true)
    } finally {
      setIsLoading(false)
    }
  }

  const closeViewer = () => {
    setIsOpen(false)
    queueMicrotask(() => triggerRef.current?.focus())
  }

  return (
    <>
      <span className="my-8 block">
        <button
          ref={triggerRef}
          type="button"
          onClick={openViewer}
          className="group relative block aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl border border-line shadow-lg transition-all hover:shadow-xl motion-reduce:transition-none"
          aria-label={t('zoomImage', { alt: imageAlt })}
          aria-busy={isLoading}
        >
          <SafeImage
            src={resolvedSrc}
            alt={alt || ''}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100 motion-reduce:transition-none">
            <span className="rounded-full bg-surface/90 p-3 shadow-lg backdrop-blur-sm">
              <svg
                className="h-6 w-6 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>{t('zoomIn')}</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </span>
          </span>
        </button>
        {isLoading && (
          <span role="status" className="mt-3 block text-center text-sm text-muted">
            {t('viewerLoading')}
          </span>
        )}
        {loadFailed && (
          <span
            role="alert"
            className="mt-3 block text-center text-sm text-red-700 dark:text-red-300"
          >
            {t('viewerError')}
          </span>
        )}
        {alt && <span className="mt-3 block text-center text-sm italic text-muted">{alt}</span>}
      </span>

      {Viewer && (
        <Viewer
          open={isOpen}
          close={closeViewer}
          slides={[{ src: resolvedSrc, alt: imageAlt }]}
          carousel={{ finite: true }}
          animation={prefersReducedMotion ? { fade: 0, swipe: 0 } : undefined}
          render={{ buttonPrev: () => null, buttonNext: () => null }}
          styles={{ container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' } }}
        />
      )}
    </>
  )
}
