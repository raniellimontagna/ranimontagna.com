import { useEffect, useState } from 'react'
import { Link, usePathname } from '@/shared/config/i18n/navigation'
import { WorldControls, type WorldProps } from './world-controls'
import { getWorldLabels } from './world-labels'

const files = [
  { name: 'README.md', href: '/' },
  { name: 'about.md', href: '/#about' },
  { name: 'projects.json', href: '/projects' },
  { name: 'blog.mdx', href: '/blog' },
  { name: 'contact.ts', href: '/#contact' },
]

export function IdeWorld({ locale, onExit }: WorldProps) {
  const pathname = usePathname()
  const [hash, setHash] = useState('')
  const t = getWorldLabels(locale)
  useEffect(() => {
    const update = () => setHash(window.location.hash)
    update()
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  const active = pathname.startsWith('/projects')
    ? 'projects.json'
    : pathname.startsWith('/blog')
      ? 'blog.mdx'
      : hash === '#about'
        ? 'about.md'
        : hash === '#contact'
          ? 'contact.ts'
          : 'README.md'
  const labels = [t.home, t.about, t.projects, t.blog, t.contact]
  return (
    <>
      <div className="ide-top">
        <span aria-hidden="true">&lt;/&gt;</span>
        <span>ranimontagna.com — Code</span>
        <span>Ranielli Montagna</span>
      </div>
      <div className="ide-workbench">
        <nav aria-label="Explorer" className="ide-explorer">
          <p>EXPLORER</p>
          <strong>⌄ RANIMONTAGNA.COM</strong>
          {files.map((file, index) => (
            <Link
              key={file.name}
              href={file.href}
              prefetch={file.href === '/blog' ? false : undefined}
              aria-label={labels[index]}
              aria-current={active === file.name ? 'page' : undefined}
              onClick={() => setHash(file.href.includes('#') ? `#${file.href.split('#')[1]}` : '')}
            >
              <span aria-hidden="true">{file.name.endsWith('.json') ? '{}' : '#'}</span>
              {file.name}
            </Link>
          ))}
        </nav>
        <div className="ide-editor">
          <nav aria-label="Editor" className="ide-tabs">
            {files.map((file) => (
              <Link
                key={file.name}
                href={file.href}
                prefetch={false}
                aria-current={active === file.name ? 'page' : undefined}
                onClick={() =>
                  setHash(file.href.includes('#') ? `#${file.href.split('#')[1]}` : '')
                }
              >
                {file.name}
              </Link>
            ))}
          </nav>
          <p className="ide-breadcrumb">portfolio / src / {active}</p>
          <div className="ide-code">
            <span>01</span>
            <p>
              <i>{'// Ranielli Montagna'}</i>
              <br />
              <b>export default</b> portfolio;
              <br />
              <br />
              <i>
                {'// '}
                {t.projects} · {t.blog} · {t.contact}
              </i>
            </p>
          </div>
        </div>
      </div>
      <div className="ide-bottom">
        <span>⑂ portfolio &nbsp; ✓ UTF-8 &nbsp; TypeScript</span>
        <WorldControls locale={locale} onExit={onExit} />
      </div>
    </>
  )
}
