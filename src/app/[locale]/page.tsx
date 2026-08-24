import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Home } from '@/features/home'
import { Hero } from '@/features/home/components/hero/hero'
import { HomeHeader } from '@/features/home/components/home-header'
import { getClientMessages } from '@/shared/config/i18n/client-messages'
import { generateProfilePageJsonLd, serializeJsonLd } from '@/shared/lib/jsonld'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [heroContent, messages] = await Promise.all([Hero(), getMessages({ locale })])
  const headerContent = <HomeHeader locale={locale as 'en' | 'pt' | 'es'} />
  const profilePageJsonLd = generateProfilePageJsonLd(locale)

  return (
    <>
      <NextIntlClientProvider locale={locale} messages={getClientMessages(messages, 'home')}>
        <Home headerContent={headerContent} heroContent={heroContent} />
      </NextIntlClientProvider>
      <script
        data-jsonld="profile-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(profilePageJsonLd) }}
      />
    </>
  )
}
