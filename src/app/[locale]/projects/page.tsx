import { getTranslations } from 'next-intl/server'
import { CTASection, GitHubStats, ProjectsList } from '@/components/projects'
import { Breadcrumbs } from '@/components/ui'
import { BASE_URL } from '@/lib/constants'
import { getFeaturedRepositories, getGitHubStats, getRegularRepositories } from '@/lib/github'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('projectsPage')

  const url = `${BASE_URL}/${locale}/projects`

  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url,
      siteName: 'Ranielli Montagna',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('subtitle'),
      creator: '@raniellimontagna',
    },
    alternates: {
      canonical: url,
      languages: {
        pt: `${BASE_URL}/pt/projects`,
        en: `${BASE_URL}/en/projects`,
        es: `${BASE_URL}/es/projects`,
      },
    },
  }
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  await params
  const t = await getTranslations('projectsPage')

  const [featuredRepos, repos, stats] = await Promise.all([
    getFeaturedRepositories(),
    getRegularRepositories(27), // 27 + 3 featured = 30 total
    getGitHubStats(),
  ])

  return (
    <div className="bg-slate-50 pb-24 dark:bg-slate-950">
      <div className="container mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-12">
          <Breadcrumbs items={[{ label: t('breadcrumb') }]} />
        </div>

        <header className="mb-16 max-w-3xl">
          <h1 className="mb-6 bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl dark:from-white dark:to-slate-400">
            {t('title')}
          </h1>
          <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-400">
            {t('subtitle')}
          </p>
        </header>

        {/* GitHub Stats */}
        <section className="mb-16">
          <GitHubStats stats={stats} />
        </section>

        {/* Projects List with Filters */}
        <ProjectsList featuredRepos={featuredRepos} repos={repos} />

        <CTASection />
      </div>
    </div>
  )
}
