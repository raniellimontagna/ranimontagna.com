import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CASE_SLUGS, getCase } from '@/features/cases/cases.data'
import { CaseChapter } from '@/features/cases/components/case-chapter'
import { CaseGallery } from '@/features/cases/components/case-gallery'
import { CaseHero } from '@/features/cases/components/case-hero'
import { CaseNext } from '@/features/cases/components/case-next'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'

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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: caseUrl(locale, slug),
      images: [`${BASE_URL}${study.hero.src}`],
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description, creator: '@rannimontagna' },
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

  return (
    <article>
      <CaseHero
        study={study}
        labels={{
          kicker: t('common.kicker'),
          name: t(`${slug}.name`),
          tagline: t(`${slug}.tagline`),
          heroAlt: t(`${slug}.heroAlt`),
          live: t('common.live'),
          repo: t('common.repo'),
        }}
      />

      <CaseChapter index={1} kicker={t('common.pain')} title={t(`${slug}.pain.title`)}>
        <p data-reveal>{t(`${slug}.pain.body`)}</p>
        {caption ? (
          <p data-reveal className="font-mono text-xs text-muted">
            {caption}
          </p>
        ) : null}
      </CaseChapter>

      <CaseChapter index={2} kicker={t('common.decisions')} title={t(`${slug}.decisions.title`)}>
        <ul className="flex flex-col gap-4">
          {(t.raw(`${slug}.decisions.items`) as string[]).map((item) => (
            <li key={item} data-reveal className="flex gap-4">
              <span aria-hidden="true" className="mt-3 h-2 w-2 shrink-0 bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </CaseChapter>

      <CaseChapter index={3} kicker={t('common.product')} title={t(`${slug}.product.title`)}>
        <p data-reveal>{t(`${slug}.product.body`)}</p>
      </CaseChapter>
      <CaseGallery images={study.gallery} alts={t.raw(`${slug}.gallery`) as string[]} />

      <CaseChapter index={4} kicker={t('common.build')} title={t(`${slug}.build.title`)}>
        <p data-reveal>{t(`${slug}.build.body`)}</p>
        <p data-reveal className="font-mono text-sm text-accent">
          {t(`${slug}.build.stat`)}
        </p>
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
