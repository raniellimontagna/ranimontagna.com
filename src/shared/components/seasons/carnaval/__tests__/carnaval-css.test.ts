import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(
  join(process.cwd(), 'src/shared/components/seasons/carnaval/carnaval.css'),
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
      if (rule.startsWith('.carnaval')) continue
      expect(rule).toMatch(/^:root\[data-season="carnaval"\]:not\(\[data-retro\]\)/)
    }
  }
})

// The letters rise in with `transform`; a dance on `transform` would cancel the rise.
it('dances with translate and rotate, never transform', () => {
  const dances = Array.from(css.matchAll(/@keyframes carnaval-[\w-]+\s*\{([\s\S]*?)\n\}/g))
  expect(dances).toHaveLength(3)
  for (const [, body] of dances) expect(body).not.toMatch(/transform\s*:/)
})

it('keeps its dialogs centered despite the CSS reset', () => {
  for (const [, rule] of css.matchAll(/\.carnaval-[\w-]*dialog\s*\{([^}]*)\}/g)) {
    expect(rule).toMatch(/margin:\s*auto/)
  }
})
