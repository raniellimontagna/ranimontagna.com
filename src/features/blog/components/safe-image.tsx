'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { BLOG_DEFAULT_IMAGE_PATH, resolveBlogMediaUrl } from '@/features/blog/lib/media'

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string
  fallbackSrc?: string
}

export function SafeImage({
  src,
  fallbackSrc = BLOG_DEFAULT_IMAGE_PATH,
  alt,
  className,
  fill = false,
  width = 1200,
  height = 630,
  sizes = '100vw',
  loading,
  priority = false,
  onError,
  ...props
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const resolvedSrc = typeof src === 'string' ? resolveBlogMediaUrl(src) : undefined
  const geometry = fill ? { fill: true as const } : { width, height }
  const imageSrc = !resolvedSrc || failedSrc === resolvedSrc ? fallbackSrc : resolvedSrc

  return (
    <Image
      src={imageSrc}
      alt={alt ?? ''}
      className={className}
      sizes={sizes}
      loading={priority ? 'eager' : (loading ?? 'lazy')}
      priority={priority}
      onError={(event) => {
        setFailedSrc(resolvedSrc ?? fallbackSrc)
        onError?.(event)
      }}
      {...geometry}
      {...props}
    />
  )
}
