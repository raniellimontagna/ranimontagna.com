import { getTranslations } from 'next-intl/server'
import { StaticImage } from '@/shared/components/ui/static-image/static-image'
import { ActionLink, AttoLogo, Reveal, SECTION_X, WordReveal } from '@/shared/ui-2026'
import { ATTO_CASES, ATTO_CONTACT, ATTO_SERVICES, attoWhatsappHref } from './atto.data'

export async function AttoSection() {
  const t = await getTranslations('atto')

  return (
    <section id="atto" className={`${SECTION_X} bg-background py-24 sm:py-32`}>
      {/* Anchors from the previous site (#services, #atto-front) land here. */}
      <span id="services" aria-hidden="true" />
      <span id="atto-front" aria-hidden="true" />
      <Reveal className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div className="flex flex-col gap-6">
          <AttoLogo className="h-10 w-auto self-start text-foreground sm:h-14" />
          <p data-reveal className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
            {t('kicker')}
          </p>
          <WordReveal
            text={t('title')}
            id="atto-title"
            className="text-[clamp(40px,5.6vw,92px)] leading-[0.95] font-semibold tracking-[-0.04em] text-foreground"
          />
          <p data-reveal className="max-w-xl text-lg leading-snug text-foreground sm:text-xl">
            {t('lead')}
          </p>
          <ul
            data-reveal
            aria-label={t('servicesLabel')}
            className="flex flex-wrap gap-x-3 gap-y-1 text-xl font-semibold text-foreground sm:text-2xl"
          >
            {ATTO_SERVICES.map((service, index) => (
              <li key={service} className="flex items-center gap-3">
                {t(`services.${service}`)}
                {index < ATTO_SERVICES.length - 1 ? (
                  <span aria-hidden="true" className="text-accent">
                    /
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ActionLink href={attoWhatsappHref(t('whatsappMessage'))} external>
              {t('ctaWhatsapp')}
            </ActionLink>
            <ActionLink href={ATTO_CONTACT.site} variant="quiet" external>
              {t('siteLink')}
            </ActionLink>
          </div>
        </div>

        <div className="flex flex-col">
          <p data-reveal className="mb-4 font-mono text-xs tracking-[0.2em] text-muted uppercase">
            {t('casesLabel')}
          </p>
          <ol className="border-t border-line">
            {ATTO_CASES.map((item, index) => (
              <li
                key={item.id}
                data-reveal
                data-atto-case={item.id}
                className="border-b border-line"
              >
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-baseline gap-5 py-6 [&::-webkit-details-marker]:hidden">
                    <span aria-hidden="true" className="font-mono text-xs text-muted">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex flex-1 flex-col gap-1">
                      <span className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {item.name}
                      </span>
                      <span className="text-base text-muted">{t(`cases.${item.id}.tagline`)}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-2xl text-accent transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="flex flex-col gap-4 pb-8 pl-10">
                    {item.image ? (
                      <div className="relative aspect-[8/5] w-full max-w-2xl overflow-hidden rounded-[2px] bg-surface">
                        <StaticImage
                          src={item.image}
                          alt={t('caseImageAlt', { name: item.name })}
                          fill
                          sizes="(min-width: 1024px) 40vw, 90vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <p className="max-w-xl text-base leading-relaxed text-foreground">
                      {t(`cases.${item.id}.description`)}
                    </p>
                    {item.url ? (
                      <ActionLink href={item.url} variant="quiet" external className="self-start">
                        {t('visitSite')} · {item.url.replace('https://', '')}
                      </ActionLink>
                    ) : null}
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  )
}
