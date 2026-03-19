'use client'

import { useTranslations } from 'next-intl'
import { Header } from '@/shared/components/layout/header/header'

export function BlogHeader() {
  const t = useTranslations('blog')

  return <Header title="Blog" backHref="/" backLabel={t('backToPortfolio')} />
}
