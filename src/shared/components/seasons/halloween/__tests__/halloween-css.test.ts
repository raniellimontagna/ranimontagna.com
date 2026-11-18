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
it('flickers with color and text-shadow only', () => {
  const body = /@keyframes halloween-flicker\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? ''
  expect(body).toMatch(/color:/)
  expect(body).not.toMatch(/transform\s*:/)
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
