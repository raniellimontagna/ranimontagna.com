import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ProjectsIndex } from '@/features/projects/components/projects-index'
import { getGitHubProjectSnapshot } from '@/features/projects/lib/github.server'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'

function getProjectsUrl(locale: string): string {
  const isDefault = locale === routing.defaultLocale
  return isDefault ? `${BASE_URL}/projects` : `${BASE_URL}/${locale}/projects`
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'projectsIndex' })

  const url = getProjectsUrl(locale)

  return {
    title: t('metaTitle'),
    description: t('lead'),
    openGraph: {
      title: t('metaTitle'),
      description: t('lead'),
      url,
      siteName: 'Ranielli Montagna',
      locale: locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaTitle'),
      description: t('lead'),
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
  const snapshot = await getGitHubProjectSnapshot()

  return ProjectsIndex({ snapshot, locale })
}
