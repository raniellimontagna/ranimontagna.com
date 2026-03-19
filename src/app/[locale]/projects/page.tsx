import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CTASection, GitHubStats, ProjectsList } from '@/features/projects/components'
import {
  getFeaturedRepositories,
  getGitHubStats,
  getRegularRepositories,
} from '@/features/projects/lib/github'
import { BlurReveal, FadeIn, RevealText } from '@/shared/components/animations'
import { Breadcrumbs } from '@/shared/components/ui'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'

function getProjectsUrl(locale: string): string {
  const isDefault = locale === routing.defaultLocale
  return isDefault ? `${BASE_URL}/projects` : `${BASE_URL}/${locale}/projects`
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'projectsPage' })

  const url = getProjectsUrl(locale)

  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url,
      siteName: 'Ranielli Montagna',
      locale: locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('subtitle'),
      creator: '@rannimontagna',
    },
    alternates: {
      canonical: url,
      languages: {
        'x-default': `${BASE_URL}/projects`,
        pt: `${BASE_URL}/projects`,
        en: `${BASE_URL}/en/projects`,
        es: `${BASE_URL}/es/projects`,
      },
    },
  }
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'projectsPage' })
  const maybeRaw = t as unknown as { raw?: (key: string) => unknown }
  const rawPoints = maybeRaw.raw?.('content.points')
  const contentPoints = Array.isArray(rawPoints)
    ? rawPoints.filter((point): point is string => typeof point === 'string')
    : []

  const [featuredRepos, repos, stats] = await Promise.all([
    getFeaturedRepositories(),
    getRegularRepositories(27), // 27 + 3 featured = 30 total
    getGitHubStats(),
  ])

  return (
    <div className="relative min-h-screen bg-background pb-14 sm:pb-20 lg:pb-24">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 atmospheric-grid opacity-30" />
      <div className="absolute top-0 right-1/4 -z-10 h-112 w-md rounded-full bg-accent-ice/10 blur-[120px]" />

      <div className="container mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12 lg:pt-16">
        <div className="mb-8 sm:mb-12">
          <Breadcrumbs items={[{ label: t('breadcrumb') }]} />
        </div>

        <header className="mb-10 max-w-3xl sm:mb-14 lg:mb-16">
          <h1 className="mb-4 font-heading text-3xl font-semibold tracking-[-0.05em] text-foreground sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            <RevealText text={t('title')} />
          </h1>
          <FadeIn delay={0.3} blur>
            <p className="text-base leading-relaxed text-muted sm:text-lg lg:text-xl">{t('subtitle')}</p>
          </FadeIn>
        </header>

        <BlurReveal delay={0.4}>
          <section className="surface-panel-strong relative mb-10 overflow-hidden rounded-3xl border border-line p-4 shadow-sm sm:mb-14 sm:rounded-4xl sm:p-6 lg:mb-16 lg:p-10">
            {/* Subtle Glow inside the intro card */}
            <div className="pointer-events-none absolute inset-0 glow-gradient-subtle" />

            <div className="relative z-10">
              <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground sm:mb-4 sm:text-2xl lg:text-3xl">
                {t('content.title')}
              </h2>
              <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted sm:gap-4 sm:text-base lg:text-lg">
                <p>{t('content.paragraph1')}</p>
                <p>{t('content.paragraph2')}</p>
              </div>

              <ul className="mt-4 flex flex-col gap-2.5 sm:mt-6 sm:gap-3">
                {contentPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/20" />
                    <span className="text-sm text-muted sm:text-base">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </BlurReveal>

        {/* GitHub Stats */}
        <section className="mb-10 sm:mb-14 lg:mb-16">
          <GitHubStats stats={stats} />
        </section>

        {/* Projects List with Filters */}
        <ProjectsList featuredRepos={featuredRepos} repos={repos} />

        <CTASection />
      </div>
    </div>
  )
}
