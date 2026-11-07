import { PhotoReveal, SECTION_X } from '@/shared/ui-2026'
import type { CaseImage } from '../cases.data'

export function CaseGallery({
  images,
  alts,
}: {
  images: readonly CaseImage[]
  alts: readonly string[]
}) {
  return (
    <div
      className={`${SECTION_X} grid gap-6 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.6fr)] lg:items-end`}
    >
      {images.map((image, index) => (
        <PhotoReveal
          key={`${image.src}-${index}`}
          src={image.src}
          alt={alts[index] ?? ''}
          effect="mask"
          sizes={image.phone ? '(max-width: 1023px) 70vw, 25vw' : '(max-width: 1023px) 100vw, 65vw'}
          className={
            image.phone
              ? 'mx-auto aspect-[9/19] w-[70%] rounded-[1.4rem] border-4 border-foreground/80 lg:w-full'
              : `aspect-[16/10] w-full border border-line ${index === images.length - 1 ? 'lg:col-span-2' : ''}`
          }
        />
      ))}
    </div>
  )
}
