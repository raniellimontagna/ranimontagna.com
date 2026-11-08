import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'src/app/[locale]/globals.css'), 'utf8')

describe('cycle scenes below lg: CSS scroll reveal', () => {
  it('runs only with scroll-timeline support, motion allowed and below lg', () => {
    const start = css.indexOf('@supports (animation-timeline: view())')
    expect(start).toBeGreaterThan(-1)
    const block = css.slice(start, css.indexOf('/* end scroll scenes */'))
    expect(block).toContain(
      '@media (prefers-reduced-motion: no-preference) and (max-width: 1023px)',
    )
    expect(block).toMatch(/\.scroll-scene\s*\{[^}]*animation-timeline:\s*view\(\)/)
    expect(block).toMatch(/\.scroll-scene-copy\s*\{[^}]*animation-range:\s*entry 0% entry 100%/)
    expect(css.slice(0, start)).not.toContain('.scroll-scene')
  })

  it('zooms the background from 1.12 and lifts the copy 32px, with transform and opacity only', () => {
    expect(css).toMatch(/@keyframes scene-zoom\s*\{\s*from\s*\{\s*scale:\s*1\.12;?\s*\}/)
    expect(css).toMatch(
      /@keyframes scene-in\s*\{\s*from\s*\{\s*opacity:\s*0;\s*translate:\s*0 32px;?\s*\}/,
    )
  })
})
