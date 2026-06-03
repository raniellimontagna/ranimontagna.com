'use client'

import { useState } from 'react'
import { BLOG_DEFAULT_IMAGE_PATH, resolveBlogMediaUrl } from '@/features/blog/lib/media'

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

export function SafeImage({
  src,
  fallbackSrc = BLOG_DEFAULT_IMAGE_PATH,
  alt,
  className,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false)
  const resolvedSrc = typeof src === 'string' ? resolveBlogMediaUrl(src) : undefined

  return (
    // biome-ignore lint/performance/noImgElement: This is a fallback image component
    <img
      src={error || !resolvedSrc ? fallbackSrc : resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  )
}
