import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CASE_SLUGS, caseHost, getCase } from '@/features/cases/cases.data'
import { CaseChapter } from '@/features/cases/components/case-chapter'
import { CaseHero } from '@/features/cases/components/case-hero'
import { CaseNext } from '@/features/cases/components/case-next'
import { CaseTour, type TourCopy } from '@/features/cases/components/case-tour'
import { CommitCount } from '@/features/cases/components/commit-count'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'
import { ScrubText, WordReveal } from '@/shared/ui-2026'

type Params = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) => CASE_SLUGS.map((slug) => ({ locale, slug })))
}

function caseUrl(locale: string, slug: string) {
  return locale === 'pt' ? `${BASE_URL}/projects/${slug}` : `${BASE_URL}/${locale}/projects/${slug}`
}

export async function generateMetadata({ params }: Params) {
  const { locale, slug } = await params
  const study = getCase(slug)
  if (!study) return {}
  const t = await getTranslations({ locale, namespace: 'cases' })
  const title = `${t(`${slug}.name`)} · Ranielli Montagna`
  const description = t(`${slug}.tagline`)
  const image = { url: `${BASE_URL}${study.shareImage}`, width: 1200, height: 630 }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: caseUrl(locale, slug),
      images: [image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@rannimontagna',
      images: [image.url],
    },
    alternates: {
      canonical: caseUrl(locale, slug),
      languages: Object.fromEntries(routing.locales.map((l) => [l, caseUrl(l, slug)])),
    },
  }
}

export default async function CasePage({ params }: Params) {
  const { locale, slug } = await params
  const study = getCase(slug)
  if (!study) notFound()
  setRequestLocale(locale)

  const t = await getTranslations('cases')
  const caption = t(`${slug}.pain.caption`)
  const tour = (id: string): TourCopy => ({
    title: t(`${slug}.tour.${id}.title`),
    body: t(`${slug}.tour.${id}.body`),
    deskAlt: t(`${slug}.tour.${id}.deskAlt`),
    phoneAlt: t(`${slug}.tour.${id}.phoneAlt`),
  })

  return (
    <article>
      <CaseHero
        study={study}
        labels={{
          kicker: t('common.kicker'),
          name: t(`${slug}.name`),
          tagline: t(`${slug}.tagline`),
          heroAlt: t(`${slug}.heroAlt`),
          heroPhoneAlt: t(`${slug}.heroPhoneAlt`),
          live: t('common.live'),
          repo: t('common.repo'),
        }}
      />

      <CaseChapter
        index={1}
        kicker={t('common.pain')}
        title={t(`${slug}.pain.title`)}
        stagger={0.02}
      >
        <ScrubText effect="fill">
          <WordReveal
            as="p"
            text={t(`${slug}.pain.body`)}
            className="text-2xl leading-snug tracking-[-0.01em] text-foreground sm:text-3xl"
          />
        </ScrubText>
        {caption ? (
          <p data-reveal className="font-mono text-xs text-muted">
            {caption}
          </p>
        ) : null}
      </CaseChapter>

      <CaseChapter index={2} kicker={t('common.decisions')} title={t(`${slug}.decisions.title`)}>
        <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {(t.raw(`${slug}.decisions.items`) as string[]).map((item, index) => (
            <li key={item} data-reveal className="flex flex-col gap-3 border-t border-line pt-5">
              <span className="font-mono text-xs tracking-[0.2em] text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-lg leading-relaxed">{item}</p>
            </li>
          ))}
        </ol>
      </CaseChapter>

      <CaseTour
        index={3}
        kicker={t('common.product')}
        title={t(`${slug}.product.title`)}
        body={t(`${slug}.product.body`)}
        listLabel={t('common.tour')}
        host={caseHost(study)}
        steps={study.tour}
        copy={tour}
      />

      <CaseChapter index={4} kicker={t('common.build')} title={t(`${slug}.build.title`)}>
        <div data-reveal>
          <CommitCount
            agent={study.commits.agent}
            total={study.commits.total}
            locale={locale}
            label={t(`${slug}.build.statLabel`)}
          />
        </div>
        <p data-reveal>{t(`${slug}.build.body`)}</p>
        <ul data-reveal className="flex flex-wrap gap-2" aria-label={t('common.stack')}>
          {study.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted"
            >
              {tech}
            </li>
          ))}
        </ul>
      </CaseChapter>

      <CaseNext next={study.next} label={t('common.next')} name={t(`${study.next}.name`)} />
    </article>
  )
}
