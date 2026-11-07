import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Home } from '@/features/home'
import { Hero2026 } from '@/features/home/components/hero/hero-2026'
import { HomeHeader } from '@/features/home/components/home-header'
import { HomeIntro } from '@/features/home/components/home-intro'
import { SmoothScroll } from '@/shared/components/motion'
import { getClientMessages } from '@/shared/config/i18n/client-messages'
import { generateProfilePageJsonLd, serializeJsonLd } from '@/shared/lib/jsonld'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [heroContent, introContent, messages] = await Promise.all([
    Hero2026(),
    HomeIntro(),
    getMessages({ locale }),
  ])
  const headerContent = <HomeHeader locale={locale as 'en' | 'pt' | 'es'} />
  const profilePageJsonLd = generateProfilePageJsonLd(locale)

  return (
    <>
      <NextIntlClientProvider locale={locale} messages={getClientMessages(messages, 'home')}>
        <SmoothScroll>
          <Home
            headerContent={headerContent}
            heroContent={heroContent}
            introContent={introContent}
          />
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
