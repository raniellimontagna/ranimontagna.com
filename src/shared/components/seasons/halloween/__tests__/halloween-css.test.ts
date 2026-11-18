import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(
  join(process.cwd(), 'src/shared/components/seasons/halloween/halloween.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '')

const selectors = Array.from(css.matchAll(/([^{}]+)\{/g), ([, selector]) => selector.trim())
  .filter((selector) => !selector.startsWith('@'))
  .filter((selector) => !/^(from|to|[\d.,%\s]+)$/.test(selector))

it('gates every rule on page elements outside the layer by the season attribute', () => {
  expect(selectors.length).toBeGreaterThan(0)
  for (const selector of selectors) {
    for (const part of selector.split(',')) {
      const rule = part.trim().replace(/\s+/g, ' ')
      if (rule.startsWith('.halloween')) continue
      expect(rule).toMatch(/^:root\[data-season="halloween"\]:not\(\[data-retro\]\)/)
    }
  }
})

// The letters rise in with `transform`; a flicker on `transform` would cancel the rise.
it('flickers with color and text-shadow only, eased, after the rise', () => {
  const body = /@keyframes halloween-flicker\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? ''
  expect(body).toMatch(/color:/)
  expect(body).not.toMatch(/transform\s*:/)
  const letters = /\[data-hero-title\] \[data-letter\] \{([^}]*)\}/.exec(css)?.[1] ?? ''
  expect(letters).toMatch(/animation:\s*letter-rise /)
  expect(letters).toMatch(/halloween-flicker [\d.]+s ease-in-out infinite/)
  // Stepped timing turned the flicker into a strobe.
  expect(css).not.toMatch(/steps\(/)
})

it('makes room under the footer while the hunt corner is shown', () => {
  expect(css).toMatch(
    /:root\[data-season="halloween"\]:not\(\[data-retro\]\):has\(\.halloween-hunt-bar\) \[data-site-footer\]\s*\{[^}]*padding-bottom/,
  )
})

// Only inside the no-preference queries does anything crawl, dangle or flicker.
it('moves nothing for visitors who prefer reduced motion', () => {
  const outside = css.replace(
    /@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\n\}/g,
    '',
  )
  expect(outside).not.toMatch(/animation\s*:/)
})

it('keeps its dialog centered despite the CSS reset', () => {
  const rule = /\.halloween-card-dialog\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  expect(rule).toMatch(/margin:\s*auto/)
})
