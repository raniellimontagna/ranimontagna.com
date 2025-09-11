import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'

import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import { routing } from '@/i18n/routing'
import { getSEOData, getAlternateLanguages } from '@/lib/seo'
import { generatePersonJsonLd, generateWebsiteJsonLd } from '@/lib/jsonld'

import { WebVitals, GoogleAnalytics } from '@/components'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const seo = getSEOData(locale)
  const alternateLanguages = getAlternateLanguages()

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
      canonical: `https://ranimontagna.com/${locale}`,
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
        <WebVitals />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
