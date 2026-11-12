import { getTranslations } from 'next-intl/server'
import { RetroSecret } from '@/shared/components/retro-mode/retro-secret'
import { Link } from '@/shared/config/i18n/navigation'

const RETRO_MODES = ['dos', 'mac', 'gameboy', 'xp', 'newspaper', 'ide'] as const

export async function SiteFooter() {
  const t = await getTranslations('shell')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line px-4 py-8 sm:px-8 lg:px-12">
      <div className="flex flex-col gap-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} Ranielli Montagna · {t('footer.madeWith')}
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/blog" className="inline-flex min-h-11 items-center hover:text-foreground">
            {t('footer.blog')}
          </Link>
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center hover:text-foreground"
          >
            {t('footer.projects')}
          </Link>
          <span className="flex items-center gap-1 opacity-60" title={t('footer.retro')}>
            {RETRO_MODES.map((mode) => (
              <RetroSecret key={mode} mode={mode} />
            ))}
          </span>
        </div>
      </div>
    </footer>
  )
}
