import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import './globals.css'

import { GoogleAnalytics, ThemeProvider, WebVitals } from '@/components'
import { routing } from '@/i18n/routing'
import { generatePersonJsonLd, generateWebsiteJsonLd } from '@/lib/jsonld'
import { getAlternateLanguages, getCanonicalUrl, getSEOData } from '@/lib/seo'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const seo = getSEOData(locale)
  const alternateLanguages = getAlternateLanguages()
  const canonicalUrl = getCanonicalUrl(locale)

  return {
    metadataBase: new URL('https://ranimontagna.com'),
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
      url: `https://ranimontagna.com/${locale}`,
      title: seo.ogTitle,
      description: seo.ogDescription,
      siteName: 'Ranielli Montagna Portfolio',
      images: [
        {
          url: 'https://ranimontagna.com/og-image.png',
          width: 1200,
          height: 630,
          alt: seo.ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      creator: '@rannimontagna',
      images: ['https://ranimontagna.com/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    manifest: '/manifest.json',
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

  const personJsonLd = generatePersonJsonLd(locale)
  const websiteJsonLd = generateWebsiteJsonLd(locale)

  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <WebVitals />
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          )}
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
