import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ProjectsHeader } from '@/features/projects/components'
import { getClientMessages } from '@/shared/config/i18n/client-messages'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function ProjectsLayout({ children, params }: Props) {
  const { locale } = await params
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={getClientMessages(messages, 'projects')}>
      <ProjectsHeader />
      <main id="main-content" tabIndex={-1} className="min-h-screen pt-16">
        {children}
      </main>
    </NextIntlClientProvider>
  )
}
