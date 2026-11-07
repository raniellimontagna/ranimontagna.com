import { getTranslations } from 'next-intl/server'
import { PhotoReveal, Reveal, SECTION_X, WordReveal } from '@/shared/ui-2026'

/** A pause after the cycle: a real photo that opens with the scroll, and one line about him. */
export async function Interlude() {
  const t = await getTranslations('interlude')

  return (
    <section
      aria-label={t('label')}
      className={`${SECTION_X} grid gap-10 bg-background py-24 sm:py-32 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-20`}
    >
      <PhotoReveal
        src="/images/hero-ranielli.webp"
        alt={t('photoAlt')}
        effect="mask"
        sizes="(max-width: 1023px) 100vw, 45vw"
        className="aspect-[3/4] w-full rounded-[2px]"
      />
      <Reveal className="flex flex-col gap-6">
        <p data-reveal className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
          {t('kicker')}
        </p>
        <WordReveal
          as="p"
          text={t('statement')}
          className="text-[clamp(36px,4.8vw,80px)] leading-[0.98] font-semibold tracking-[-0.035em] text-foreground"
        />
        <p data-reveal className="max-w-xl text-lg leading-snug text-foreground sm:text-xl">
          {t('detail')}
        </p>
      </Reveal>
    </section>
  )
}
