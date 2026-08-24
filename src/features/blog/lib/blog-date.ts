const SUPPORTED_LOCALES = new Set(['en', 'pt', 'es'])

export function formatBlogDate(date: string, locale: string): string {
  const resolvedLocale = SUPPORTED_LOCALES.has(locale) ? locale : 'en'
  return new Intl.DateTimeFormat(resolvedLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`))
}
