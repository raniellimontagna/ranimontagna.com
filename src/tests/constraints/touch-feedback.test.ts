import { readFileSync } from 'node:fs'

const css = readFileSync('src/app/[locale]/globals.css', 'utf8')

describe('touch feedback and scroll progress (mobile round §8, §9)', () => {
  it('presses to 0.97 in 100 ms, only with motion allowed', () => {
    const start = css.indexOf('/* press */')
    expect(start).toBeGreaterThan(-1)
    const block = css.slice(start, css.indexOf('/* end press */'))
    expect(block).toContain('@media (prefers-reduced-motion: no-preference)')
    expect(block).toMatch(/\.press:active\s*\{[^}]*animation:\s*press 100ms/)
    expect(css).toMatch(/@keyframes press\s*\{\s*to\s*\{\s*scale:\s*0\.97;?\s*\}/)
  })

  it('drives the progress line from the document scroll where supported', () => {
    const start = css.indexOf('@supports (animation-timeline: scroll())')
    expect(start).toBeGreaterThan(-1)
    const block = css.slice(start, css.indexOf('/* end scroll progress */'))
    expect(block).toMatch(/\.scroll-progress\s*\{[^}]*animation-timeline:\s*scroll\(root block\)/)
  })

  it('leaves blog posts to their own reading progress', () => {
    expect(css).toMatch(
      /:root:has\(\[data-reading-progress\]\) \.scroll-progress\s*\{\s*display:\s*none/,
    )
    expect(readFileSync('src/features/blog/components/reading-progress.tsx', 'utf8')).toContain(
      'data-reading-progress',
    )
  })
})
