import { Link } from '@/shared/config/i18n/navigation'
import { WorldControls, type WorldProps } from './world-controls'
import { getWorldLabels } from './world-labels'

function MacFolder() {
  return (
    <svg
      width="44"
      height="36"
      viewBox="0 0 44 36"
      fill="white"
      stroke="black"
      strokeWidth="2"
      aria-hidden="true"
    >
      <title>Folder</title>
      <path d="M2 6h16l4 5h20v23H2z" />
      <path d="M2 14h40" />
    </svg>
  )
}

export function MacWorld({ locale, onExit }: WorldProps) {
  const t = getWorldLabels(locale)
  const copy =
    locale === 'en'
      ? {
          computer: "Ranielli's Macintosh",
          desktop: 'Macintosh desktop',
          portfolio: 'Personal portfolio',
        }
      : locale === 'es'
        ? {
            computer: 'Macintosh de Ranielli',
            desktop: 'Escritorio Macintosh',
            portfolio: 'Portafolio personal',
          }
        : {
            computer: 'Macintosh do Ranielli',
            desktop: 'Área de trabalho Macintosh',
            portfolio: 'Portfólio pessoal',
          }
  return (
    <>
      <nav className="mac-menubar" aria-label="Finder">
        <strong>◈ Finder</strong>
        <Link href="/">{t.home}</Link>
        <Link href="/#about">{t.about}</Link>
        <Link href="/#contact">{t.contact}</Link>
      </nav>
      <div className="mac-desktop">
        <p>{copy.computer}</p>
        <nav aria-label={copy.desktop}>
          {[
            { name: t.about, href: '/#about' },
            { name: t.projects, href: '/projects' },
            { name: t.blog, href: '/blog' },
            { name: t.contact, href: '/#contact' },
          ].map((item) => (
            <Link key={item.href} href={item.href} prefetch={false}>
              <MacFolder />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mac-window-title">
        <span aria-hidden="true">□</span>
        <strong>Ranielli Montagna</strong>
        <span aria-hidden="true">▥</span>
      </div>
      <div className="mac-bottom">
        <span>Macintosh · {copy.portfolio}</span>
        <WorldControls locale={locale} onExit={onExit} />
      </div>
    </>
  )
}
