import { getImageProps, type ImageProps } from 'next/image'
import { preload } from 'react-dom'

type StaticImageProps = Omit<
  ImageProps,
  'blurDataURL' | 'loader' | 'onError' | 'onLoad' | 'onLoadingComplete' | 'placeholder'
>

/**
 * next/image markup for server components, without the client component.
 *
 * The <img> gets the same optimized src, srcSet, sizes, loading and fill
 * styles, and `priority` still emits the same preload hint, but there is no
 * client reference in the RSC payload and nothing to hydrate. Use it for
 * images that need no load/error callbacks or blur placeholder.
 */
export function StaticImage({ alt, ...rest }: StaticImageProps) {
  const eager = Boolean(rest.priority || rest.preload)
  // getImageProps no longer sets fetchPriority for priority images: an LCP image
  // asks for it explicitly, or it waits behind scripts and styles.
  const { props } = getImageProps({
    alt,
    ...rest,
    fetchPriority: rest.fetchPriority ?? (eager ? 'high' : undefined),
  })

  if (eager) {
    preload(props.src, {
      as: 'image',
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
      crossOrigin: props.crossOrigin,
      referrerPolicy: props.referrerPolicy,
      fetchPriority: props.fetchPriority,
    })
  }

  // biome-ignore lint/performance/noImgElement: same markup next/image renders, minus hydration.
  return <img {...props} alt={alt} data-nimg={rest.fill ? 'fill' : '1'} />
}
