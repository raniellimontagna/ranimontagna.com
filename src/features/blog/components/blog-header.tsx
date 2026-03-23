'use client'

import { useTranslations } from 'next-intl'
import { Header } from '@/shared/components/layout/header/header'
import { usePathname } from '@/shared/config/i18n/navigation'

export function BlogHeader() {
  const t = useTranslations('blog')
  const pathname = usePathname()

  const isPostPage = pathname.startsWith('/blog/')

  return (
    <Header
      title="Blog"
      backHref={isPostPage ? '/blog' : '/'}
      backLabel={isPostPage ? t('backToBlog') : t('backToPortfolio')}
    />
  )
}
