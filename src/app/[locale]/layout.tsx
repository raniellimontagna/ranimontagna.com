import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'

import { RetroExperience } from '@/shared/components/retro-mode/retro-mode'
import { getClientMessages } from '@/shared/config/i18n/client-messages'
import { routing } from '@/shared/config/i18n/routing'
import { BASE_URL } from '@/shared/lib/constants'
import { generatePersonJsonLd, generateWebsiteJsonLd, serializeJsonLd } from '@/shared/lib/jsonld'
import { getAlternateLanguages, getCanonicalUrl, getSEOData, getShareImage } from '@/shared/lib/seo'
import { isIndexingDisabled, robotsMetadata } from '@/shared/lib/seo/indexing'
import { ScrollProgress, ShellWidgets, SiteFooter, SiteHeader, VegaLauncher } from '@/shared/shell'
import { THEME_INIT_SCRIPT } from './theme-init-script'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const seo = getSEOData(locale)
  const alternateLanguages = getAlternateLanguages()
  const canonicalUrl = getCanonicalUrl(locale)
  // A real 1200x630 card per language (public/og). The old og-image.png stays for
  // links already shared, but it was a portrait photo declared as 1200x630.
  const shareImage = getShareImage(locale)

  return {
    metadataBase: new URL(BASE_URL),
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: 'Ranielli Montagna' }],
    creator: 'Ranielli Montagna',
    publisher: 'Ranielli Montagna',
    category: 'Technology',
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_ES' : 'en_US',
      url: canonicalUrl,
      title: seo.ogTitle,
      description: seo.ogDescription,
      siteName: 'Ranielli Montagna Portfolio',
      images: [{ ...shareImage, alt: seo.ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      creator: '@rannimontagna',
      images: [shareImage.url],
    },
    robots: robotsMetadata(isIndexingDisabled(process.env)),
    manifest: '/manifest.json',
    icons: {
      icon: [{ url: '/logo/white.svg', type: 'image/svg+xml' }],
      apple: '/logo/white.svg',
      shortcut: '/logo/white.svg',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Ranielli Montagna',
    },
    formatDetection: {
      telephone: false,
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const [messages, t, tShell] = await Promise.all([
    getMessages({ locale }),
    getTranslations({ locale, namespace: 'accessibility' }),
    getTranslations({ locale, namespace: 'shell' }),
  ])
  const personJsonLd = generatePersonJsonLd(locale)
  const websiteJsonLd = generateWebsiteJsonLd(locale)

  return (
    <html lang={locale} className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
        />
      </head>
      <body className="antialiased">
        <a
          href="#main-content"
          className="fixed top-0 left-4 z-[100] -translate-y-full rounded-b-xl bg-foreground px-4 py-3 font-semibold text-background shadow-panel transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-focus"
        >
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider locale={locale} messages={getClientMessages(messages, 'shell')}>
          <RetroExperience locale={locale} />
          <ScrollProgress />
          <SiteHeader />
          {children}
          <SiteFooter />
          <VegaLauncher label={tShell('vega')} />
          <ShellWidgets />
        </NextIntlClientProvider>
        <script
          data-jsonld="person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd) }}
        />
        <script
          data-jsonld="website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
        />
      </body>
    </html>
  )
}
