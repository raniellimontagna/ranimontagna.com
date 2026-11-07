'use client'

import { useLocale, useTranslations } from 'next-intl'
import { openAltair } from '@/shared/lib/altair-events'
import { StatusView } from '@/shared/ui-2026'

export default function NotFoundPage() {
  const t = useTranslations('notFound')
  // StatusView renders plain anchors; keep the visitor in their language.
  const locale = useLocale()
  const prefix = locale === 'pt' ? '' : `/${locale}`

  return (
    <StatusView
      code="404"
      title={t('title')}
      body={t('description')}
      actions={[
        { label: t('backHome'), href: prefix || '/' },
        { label: t('links.blog.title'), href: `${prefix}/blog` },
        { label: t('askAltair'), onClick: openAltair },
      ]}
    />
  )
}
