import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'

import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import { routing } from '@/i18n/routing'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Ranielli Montagna - Desenvolvedor Full Stack',
  description:
    'Portfolio de Ranielli Montagna - Desenvolvedor Full Stack especializado em React, Next.js, Node.js e design de interfaces modernas. Criando experiências digitais excepcionais.',
  keywords:
    'desenvolvedor full stack, react, nextjs, nodejs, typescript, ui/ux designer, portfolio, rani montagna, ranielli montagna, ranielli',
  authors: [{ name: 'Rani Montagna' }],
  creator: 'Ranielli Montagna',
  publisher: 'Ranielli Montagna',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://ranimontagna.com',
    title: 'Ranielli Montagna - Desenvolvedor Full Stack ',
    description:
      'Portfolio de Ranielli Montagna - Desenvolvedor Full Stack especializado em React, Next.js, Node.js e design de interfaces modernas.',
    siteName: 'Ranielli Montagna Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ranielli Montagna - Desenvolvedor Full Stack ',
    description:
      'Portfolio de Ranielli Montagna - Desenvolvedor Full Stack especializado em React, Next.js, Node.js e design de interfaces modernas.',
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
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
