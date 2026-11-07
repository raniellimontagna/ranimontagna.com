import { getTranslations } from 'next-intl/server'
import { Link } from '@/shared/config/i18n/navigation'
import { HeaderBehavior } from './header-behavior'
import { PreferencesMenu } from './preferences-menu'
import { SiteMenu } from './site-menu'
import { SITE_NAV, type SiteNavId } from './site-nav'

export async function SiteHeader() {
  const t = await getTranslations('shell')
  const items = Object.fromEntries(
    SITE_NAV.map((item) => [item.id, t(`nav.${item.labelKey}`)]),
  ) as Record<SiteNavId, string>

  return (
    <HeaderBehavior>
      <div className="flex h-16 items-center justify-between gap-6 px-4 sm:px-8 lg:px-12">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight text-foreground">
          Ranielli Montagna
        </Link>

        <nav aria-label={t('nav.label')} className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {SITE_NAV.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {items[item.id]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <PreferencesMenu
            labels={{
              open: t('prefs.open'),
              language: t('prefs.language'),
              theme: t('prefs.theme'),
              light: t('prefs.light'),
              dark: t('prefs.dark'),
              accent: t('prefs.accent'),
            }}
          />
          <SiteMenu
            labels={{
              open: t('menu.open'),
              close: t('menu.close'),
              title: t('menu.title'),
              socials: t('menu.socials'),
              items,
            }}
          />
        </div>
      </div>
    </HeaderBehavior>
  )
}
