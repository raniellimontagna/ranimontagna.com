import { Picture } from '@/shared/components/ui/picture/picture'
import type { CycleCopy } from '../cycle.data'

export function ProductArtifact({ desktopAlt, phoneAlt }: CycleCopy['product']) {
  return (
    <div className="relative pb-10">
      <div data-reveal className="overflow-hidden rounded-xl border border-line">
        <Picture
          master="/redesign/products/grimory-compendium.webp"
          alt={desktopAlt}
          sizes="(max-width: 760px) 90vw, 40vw"
          className="h-auto w-full"
        />
      </div>
      <div
        data-reveal
        className="absolute right-[-4%] bottom-0 w-[30%] overflow-hidden rounded-[1.4rem] border-4 border-foreground/80"
      >
        <Picture
          master="/redesign/products/klick-mobile.webp"
          alt={phoneAlt}
          sizes="(max-width: 760px) 30vw, 12vw"
          className="h-auto w-full"
        />
      </div>
    </div>
  )
}
