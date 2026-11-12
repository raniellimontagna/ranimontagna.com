import type { ImgHTMLAttributes } from 'react'
import { preload } from 'react-dom'
import { copiesOf } from '@/shared/lib/image-copies/image-copies'

type PictureProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcSet' | 'sizes' | 'width' | 'height'
> & {
  /** A master listed in image-copies/copies.json; the copies are named after it. */
  master: string
  alt: string
  sizes: string
  /** Fill the positioned box, or (default) keep the master's intrinsic size. */
  fill?: boolean
  /** The page's LCP: eager, high priority, its AVIF set preloaded. */
  priority?: boolean
}

/**
 * A site image from its pre-sized static copies: AVIF where the browser takes
 * it, WebP otherwise. Server-safe; data-* and other attributes reach the
 * <img>, which is what the motion code drives.
 */
export function Picture({
  master,
  alt,
  sizes,
  fill,
  priority,
  className = '',
  ...rest
}: PictureProps) {
  const { avif, webp, src, width, height } = copiesOf(master)
  if (priority) {
    preload(src, {
      as: 'image',
      type: 'image/avif',
      imageSrcSet: avif,
      imageSizes: sizes,
      fetchPriority: 'high',
    })
  }
  return (
    <picture>
      <source type="image/avif" srcSet={avif} sizes={sizes} />
      <img
        {...rest}
        src={src}
        srcSet={webp}
        sizes={sizes}
        alt={alt}
        {...(fill ? {} : { width, height })}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={fill ? `absolute inset-0 h-full w-full ${className}` : className}
      />
    </picture>
  )
}
