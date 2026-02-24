import { defineRouting } from 'next-intl/routing'

export const locales = [
  { code: 'pt', name: 'Português (BR)' },
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Español (ES)' },
]

export const routing = defineRouting({
  locales: locales.map((loc) => loc.code),
  defaultLocale: locales[0].code,
  localePrefix: 'as-needed',
})
