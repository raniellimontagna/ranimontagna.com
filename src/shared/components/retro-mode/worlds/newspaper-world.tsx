import { Link } from '@/shared/config/i18n/navigation'
import { WorldControls, type WorldProps } from './world-controls'
import { getWorldLabels } from './world-labels'

export function NewspaperWorld({ locale, onExit }: WorldProps) {
  const t = getWorldLabels(locale)
  const copy =
    locale === 'en'
      ? {
          edition: 'Independent digital edition',
          headline: 'Engineering, products and stories worth reading.',
          motto: 'From Paraí to the World Wide Web.',
        }
      : locale === 'es'
        ? {
            edition: 'Edición digital independiente',
            headline: 'Ingeniería, productos e historias que vale la pena leer.',
            motto: 'De Paraí a la World Wide Web.',
          }
        : {
            edition: 'Edição digital independente',
            headline: 'Engenharia, produtos e histórias que valem a leitura.',
            motto: 'De Paraí para a World Wide Web.',
          }
  return (
    <>
      <div className="newspaper-masthead">
        <div className="newspaper-edition">
          <span>{copy.edition}</span>
          <span>PARAÍ · RS · BRASIL</span>
        </div>
        <p className="newspaper-name">Gazeta Montagna</p>
        <p className="newspaper-motto">{copy.motto}</p>
        <nav aria-label="Gazeta Montagna" className="newspaper-nav">
          <Link href="/">{t.home}</Link>
          <Link href="/#about">{t.about}</Link>
          <Link href="/projects">{t.projects}</Link>
          <Link href="/blog" prefetch={false}>
            {t.blog}
          </Link>
          <Link href="/#contact">{t.contact}</Link>
        </nav>
        <p className="newspaper-headline">{copy.headline}</p>
      </div>
      <div className="newspaper-bottom">
        <span>GAZETA MONTAGNA · {copy.edition}</span>
        <WorldControls locale={locale} onExit={onExit} />
      </div>
    </>
  )
}
