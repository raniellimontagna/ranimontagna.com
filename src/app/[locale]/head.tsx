import { routing } from '@/shared/config/i18n/routing'
import {
  generatePersonJsonLd,
  generateProfilePageJsonLd,
  generateWebsiteJsonLd,
} from '@/shared/lib/jsonld'

const THEME_INIT_SCRIPT = `
(() => {
  const storageKey = 'theme-storage';
  const fallbackTheme = 'dark';
  const root = document.documentElement;

  try {
    const savedTheme = localStorage.getItem(storageKey);
    const parsed = savedTheme ? JSON.parse(savedTheme) : null;
    const theme = parsed?.state?.theme === 'light' || parsed?.state?.theme === 'dark'
      ? parsed.state.theme
      : fallbackTheme;

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch {
    root.classList.remove('light', 'dark');
    root.classList.add(fallbackTheme);
    root.style.colorScheme = fallbackTheme;
  }
})();
`

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
