import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Home } from '@/features/home'
import { Hero2026 } from '@/features/home/components/hero/hero-2026'
import { HomeBody } from '@/features/home/components/home-body'
import { SmoothScroll } from '@/shared/components/motion'
import { getClientMessages } from '@/shared/config/i18n/client-messages'
import { generateProfilePageJsonLd, serializeJsonLd } from '@/shared/lib/jsonld'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [heroContent, bodyContent, messages] = await Promise.all([
    Hero2026(),
    HomeBody({ locale }),
    getMessages({ locale }),
  ])
  const profilePageJsonLd = generateProfilePageJsonLd(locale)

  return (
    <>
      <NextIntlClientProvider locale={locale} messages={getClientMessages(messages, 'home')}>
        <SmoothScroll>
          <Home heroContent={heroContent} bodyContent={bodyContent} />
        </SmoothScroll>
      </NextIntlClientProvider>
      <script
        data-jsonld="profile-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(profilePageJsonLd) }}
      />
    </>
  )
}
