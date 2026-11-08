'use client'

import { Link } from '@/shared/config/i18n/navigation'
import type { VegaCard } from './vega-card'

/** A site destination under an answer. Opening it closes Vega first. */
export function VegaCardView({
  card,
  cta,
  onOpen,
}: {
  card: VegaCard
  cta: string
  onOpen: () => void
}) {
  return (
    <Link
      href={card.href}
      onClick={onOpen}
      className={`press group/card grid overflow-hidden rounded-[10px] border border-line bg-surface transition-colors duration-300 hover:border-accent ${
        card.image ? 'grid-cols-[96px_minmax(0,1fr)]' : 'grid-cols-1'
      }`}
    >
      {/* Sections, pages and posts have no picture: no empty slot for them. */}
      {card.image ? (
        <span data-card-thumb className="relative block min-h-[72px] bg-background">
          {/* biome-ignore lint/performance/noImgElement: tiny decorative thumbnail inside an overlay. */}
          <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </span>
      ) : null}
      <span className="flex flex-col gap-1 px-3 py-2.5">
        <span className="text-sm font-semibold text-foreground">{card.title}</span>
        <span className="text-xs leading-snug text-muted">{card.summary}</span>
        <span className="mt-1 text-xs text-accent">{cta} →</span>
      </span>
    </Link>
  )
}
