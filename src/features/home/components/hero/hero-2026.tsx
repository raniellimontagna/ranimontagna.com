import { getTranslations } from 'next-intl/server'
import type { CSSProperties } from 'react'
import { HeroPortrait } from './hero-portrait'
import { VegaTrigger } from './vega-trigger'

const NAME_LINES = ['Ranielli', 'Montagna'] as const
const LETTER_STAGGER_MS = 35

function NameLetters() {
  let index = 0

  return NAME_LINES.map((line) => (
    <span key={line} className="block overflow-hidden pb-[0.08em]">
      {Array.from(line, (letter) => {
        const delay = { animationDelay: `${index++ * LETTER_STAGGER_MS}ms` } as CSSProperties

        return (
          <span
            key={`${line}-${index}`}
            data-letter
            aria-hidden="true"
            style={delay}
            className="inline-block motion-safe:animate-letter-rise"
          >
            {letter}
          </span>
        )
      })}
    </span>
  ))
}

export async function Hero2026() {
  const t = await getTranslations('hero2026')

  return (
    <section
      data-hero-2026
      className="relative grid min-h-svh grid-rows-[58svh_auto] overflow-hidden lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:grid-rows-1"
    >
      <div className="relative z-10 order-2 flex flex-col justify-end gap-6 px-4 pt-8 pb-12 sm:px-8 lg:order-1 lg:justify-center lg:px-12 lg:pt-32 lg:pb-20">
        <h1
          aria-label={NAME_LINES.join(' ')}
          data-hero-title
          className="text-[clamp(60px,8.4vw,150px)] leading-[0.88] font-semibold tracking-[-0.06em] text-foreground"
        >
          <NameLetters />
        </h1>

        <p className="max-w-[34ch] text-lg leading-snug text-foreground sm:text-xl lg:text-2xl">
          {t('lead')}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <VegaTrigger
            cta
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span aria-hidden="true">✦</span>
            {t('ctaVega')}
          </VegaTrigger>
          <a
            href="#no-ar"
            className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
          >
            {t('ctaWork')}
          </a>
        </div>

        <p className="font-mono text-xs tracking-wide text-muted">
          <span className="hidden [@media(hover:hover)]:inline">{t('hint')}</span>
          <span className="[@media(hover:hover)]:hidden">{t('hintTouch')}</span>
        </p>
      </div>

      <div className="relative order-1 h-[58svh] lg:order-2 lg:h-auto lg:min-h-svh">
        <HeroPortrait src="/photo.webp" alt={t('portraitAlt')} />
      </div>
    </section>
  )
}
