import type { ReactNode } from 'react'
import { Reveal, SECTION_X, WordReveal } from '@/shared/ui-2026'

type CaseChapterProps = {
  index: number
  kicker: string
  title: string
  children: ReactNode
  /** Seconds between pieces as they rise in; a long sentence split into words wants less. */
  stagger?: number
}

export function CaseChapter({ index, kicker, title, children, stagger }: CaseChapterProps) {
  return (
    <section className={`${SECTION_X} border-t border-line py-20 sm:py-28`}>
      <Reveal
        stagger={stagger}
        className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20"
      >
        <div className="flex flex-col gap-4">
          <p
            data-reveal
            className="flex items-baseline gap-4 font-mono text-xs tracking-[0.2em] text-accent uppercase"
          >
            <span className="text-muted">{String(index).padStart(2, '0')}</span>
            {kicker}
          </p>
          <WordReveal
            text={title}
            className="text-[clamp(36px,4.6vw,72px)] leading-[0.98] font-semibold tracking-[-0.035em] text-foreground"
          />
        </div>
        <div className="flex flex-col gap-6 text-lg leading-relaxed text-foreground">
          {children}
        </div>
      </Reveal>
    </section>
  )
}
