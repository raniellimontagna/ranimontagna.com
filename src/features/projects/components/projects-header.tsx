'use client'

import { useTranslations } from 'next-intl'
import { Header } from '@/shared/components/layout/header/header'

export function ProjectsHeader() {
  const t = useTranslations('projectsPage')

  return <Header title={t('breadcrumb')} backHref="/" backLabel={t('backToPortfolio')} />
}
