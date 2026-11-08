import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'src/app/[locale]/globals.css'), 'utf8')

const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`)
  return css.slice(start, css.indexOf('}', start))
}

describe('mobile motion foundations', () => {
  it('declares contrast floors per theme', () => {
    expect(block(':root')).toMatch(/--dim-large:\s*0\.5;/)
    expect(block(':root')).toMatch(/--dim-body:\s*0\.62;/)
    expect(block('.dark')).toMatch(/--dim-large:\s*0\.4;/)
    expect(block('.dark')).toMatch(/--dim-body:\s*0\.52;/)
  })

  it('slides [data-follow-header] with the header, below lg only', () => {
    const start = css.indexOf('/* follow header */')
    expect(start).toBeGreaterThan(-1)
    const rules = css.slice(start, css.indexOf('/* end follow header */'))
    expect(rules).toContain('@media (max-width: 1023px)')
    expect(rules).toContain('translate: 0 4rem')
    expect(rules).toContain(
      ":root:has([data-site-header][data-hidden='true']) [data-follow-header]",
    )
    expect(rules).toMatch(/prefers-reduced-motion: reduce\)[\s\S]*transition: none/)
  })
})
