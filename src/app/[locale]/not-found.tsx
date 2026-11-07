'use client'

import { useTranslations } from 'next-intl'
import { openAltair } from '@/shared/lib/altair-events'
import { StatusView } from '@/shared/ui-2026'

export default function NotFoundPage() {
  const t = useTranslations('notFound')

  return (
    <StatusView
      code="404"
      title={t('title')}
      body={t('description')}
      actions={[
        { label: t('backHome'), href: '/' },
        { label: t('links.blog.title'), href: '/blog' },
        { label: t('askAltair'), onClick: openAltair },
      ]}
    />
  )
}
