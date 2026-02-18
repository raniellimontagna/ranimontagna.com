'use client'

import { useState } from 'react'

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80'

export function SafeImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt,
  className,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false)

  return (
    // biome-ignore lint/performance/noImgElement: This is a fallback image component
    <img
      src={error || !src ? fallbackSrc : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  )
}
