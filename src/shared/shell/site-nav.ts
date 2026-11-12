export type SiteNavId = 'no-ar' | 'trajetoria' | 'atto' | 'escrita' | 'blog' | 'projetos'

export const SITE_NAV: readonly { id: SiteNavId; labelKey: string; href: string }[] = [
  { id: 'no-ar', labelKey: 'noAr', href: '/#no-ar' },
  { id: 'trajetoria', labelKey: 'trajetoria', href: '/#trajetoria' },
  { id: 'atto', labelKey: 'atto', href: '/#atto' },
  { id: 'escrita', labelKey: 'escrita', href: '/#escrita' },
  { id: 'blog', labelKey: 'blog', href: '/blog' },
  { id: 'projetos', labelKey: 'projetos', href: '/projects' },
]

export const LOCALES = [
  { id: 'pt', label: 'Português' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
] as const
