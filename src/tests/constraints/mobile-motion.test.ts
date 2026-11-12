import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'src/app/[locale]/globals.css'), 'utf8')

const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`)
  return css.slice(start, css.indexOf('}', start))
}

describe('mobile motion foundations', () => {
  it('splits phone and desktop motion exactly where Tailwind splits lg, with no fractional gap', async () => {
    const { BELOW_LG_QUERY, LG_QUERY } = await import('@/shared/components/motion')
    expect(BELOW_LG_QUERY).toBe('(width < 1024px)')
    expect(LG_QUERY).toBe('(min-width: 1024px)')
  })

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
    expect(rules).toContain('@media (width < 1024px)')
    // Same curve as the header's Tailwind transition, so they move in lockstep.
    expect(rules).toContain('transition: translate 300ms cubic-bezier(0.4, 0, 0.2, 1)')
    expect(rules).toContain('translate: 0 4rem')
    expect(rules).toContain(
      ":root:has([data-site-header][data-hidden='true']) [data-follow-header]",
    )
    expect(rules).toMatch(/prefers-reduced-motion: reduce\)[\s\S]*transition: none/)
  })

  it('maps scrubbed progress onto the theme floor in CSS, so a theme switch moves it', () => {
    expect(css).toMatch(
      /\[data-scrub-text='fill'\] \[data-reveal-word\]\s*\{\s*opacity: calc\(var\(--dim-large\) \+ \(1 - var\(--dim-large\)\) \* var\(--fill, 1\)\);/,
    )
    expect(css).toMatch(
      /\[data-post-title\]\s*\{\s*opacity: calc\(var\(--dim-large\) \+ \(1 - var\(--dim-large\)\) \* var\(--focus, 1\)\);/,
    )
  })
})
