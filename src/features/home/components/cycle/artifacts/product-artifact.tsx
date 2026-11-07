import { StaticImage } from '@/shared/components/ui/static-image/static-image'
import type { CycleCopy } from '../cycle.data'

export function ProductArtifact({ desktopAlt, phoneAlt }: CycleCopy['product']) {
  return (
    <div className="relative pb-10">
      <div data-reveal className="overflow-hidden rounded-xl border border-line">
        <StaticImage
          src="/redesign/products/grimory-compendium.webp"
          alt={desktopAlt}
          width={1600}
          height={1125}
          sizes="(max-width: 760px) 90vw, 40vw"
          className="h-auto w-full"
        />
      </div>
      <div
        data-reveal
        className="absolute right-[-4%] bottom-0 w-[30%] overflow-hidden rounded-[1.4rem] border-4 border-foreground/80"
      >
        <StaticImage
          src="/redesign/products/klick-mobile.webp"
          alt={phoneAlt}
          width={780}
          height={1688}
          sizes="(max-width: 760px) 30vw, 12vw"
          className="h-auto w-full"
        />
      </div>
    </div>
  )
}
