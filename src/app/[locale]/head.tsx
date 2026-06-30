import { routing } from '@/shared/config/i18n/routing'
import {
  generatePersonJsonLd,
  generateProfilePageJsonLd,
  generateWebsiteJsonLd,
} from '@/shared/lib/jsonld'
import { THEME_INIT_SCRIPT } from './theme-init-script'

export default async function Head({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const normalizedLocale = routing.locales.includes(locale as 'pt' | 'en' | 'es')
    ? locale
    : routing.defaultLocale

  const personJsonLd = generatePersonJsonLd(normalizedLocale)
  const websiteJsonLd = generateWebsiteJsonLd(normalizedLocale)
  const profilePageJsonLd = generateProfilePageJsonLd(normalizedLocale)

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
      />
    </>
  )
}
