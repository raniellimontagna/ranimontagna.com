import { getTranslations } from 'next-intl/server'
import { StaticImage } from '@/shared/components/ui/static-image/static-image'
import { Link } from '@/shared/config/i18n/navigation'
import { Reveal, SECTION_X, SectionHeading } from '@/shared/ui-2026'
import { LIVE_WORK, type LiveWorkItem } from './live-work.data'
import { LiveWorkTrack } from './live-work-track'

type Translate = (key: string) => string

function CardArt({ item, t }: { item: LiveWorkItem; t: Translate }) {
  if (item.image) {
    return (
      <StaticImage
        data-live-media
        src={item.image.src}
        alt={t(`items.${item.slug}.alt`)}
        fill
        sizes="(max-width: 1023px) 100vw, 60vw"
        className="object-cover object-top"
      />
    )
  }

  if (item.terminal) {
    return (
      <div
        data-card-art
        data-live-media
        className="flex h-full w-full items-center justify-center p-6"
      >
        <pre className="w-full overflow-x-auto font-mono text-xs leading-relaxed text-foreground sm:text-sm max-lg:break-words max-lg:whitespace-pre-wrap">
          {item.terminal.join('\n')}
        </pre>
      </div>
    )
  }

  return (
    <div data-card-art data-live-media className="flex h-full w-full items-end p-6">
      <span className="text-[clamp(48px,7vw,120px)] leading-none font-semibold tracking-[-0.05em] text-accent">
        {t(`items.${item.slug}.name`)}
      </span>
    </div>
  )
}

export async function LiveWork() {
  const t = await getTranslations('liveWork')

  return (
    <section
      id="no-ar"
      className="relative overflow-hidden bg-background py-24 sm:py-32 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:py-0"
    >
      {/* The old #projects anchor lands here. */}
      <span id="projects" aria-hidden="true" />
      <Reveal className={SECTION_X}>
        <SectionHeading id="no-ar" kicker={t('kicker')} title={t('title')} lead={t('lead')} />
      </Reveal>

      <LiveWorkTrack total={LIVE_WORK.length}>
        {/* Below lg: a swipe carousel of ~84vw cards. From lg: the pinned horizontal track. */}
        <ul
          data-live-track
          className={`${SECTION_X} mt-14 flex gap-4 lg:mt-10 lg:w-max lg:gap-8 max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-4 max-lg:overflow-x-auto max-lg:pb-2 max-lg:sm:scroll-px-8`}
        >
          {LIVE_WORK.map((item, index) => {
            const body = (
              <>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[2px] border border-line bg-surface lg:h-[52svh] lg:w-auto lg:aspect-[16/10]">
                  <CardArt item={item} t={t} />
                </div>
                <div className="mt-5 flex items-baseline gap-4">
                  <span aria-hidden="true" className="font-mono text-xs text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {t(`items.${item.slug}.name`)}
                    </h3>
                    <p className="max-w-md text-base text-foreground">
                      {t(`items.${item.slug}.line`)}
                    </p>
                    <p className="font-mono text-xs text-muted">{t(`items.${item.slug}.meta`)}</p>
                  </div>
                </div>
              </>
            )

            return (
              <li
                key={item.slug}
                data-live-card
                className="w-[84vw] max-w-[560px] shrink-0 snap-start lg:w-[min(60vw,880px)] lg:max-w-none"
              >
                {item.href ? (
                  item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      {body}
                    </a>
                  ) : (
                    <Link href={item.href} className="group block">
                      {body}
                    </Link>
                  )
                ) : (
                  body
                )}
              </li>
            )
          })}
        </ul>
      </LiveWorkTrack>
    </section>
  )
}
