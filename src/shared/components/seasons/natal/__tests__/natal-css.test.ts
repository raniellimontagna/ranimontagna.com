import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(
  join(process.cwd(), 'src/shared/components/seasons/natal/natal.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '')

const selectors = Array.from(css.matchAll(/([^{}]+)\{/g), ([, selector]) => selector.trim())

// The chunk's stylesheet stays loaded after Christmas is turned off or a retro world
// opens, so anything styling elements that exist outside the layer must be gated.
it('gates every rule on page elements outside the layer by the season attribute', () => {
  const outside = selectors.filter((s) => /data-chat-launcher|data-site-footer|footer/.test(s))
  expect(outside.length).toBeGreaterThan(0)
  for (const selector of outside) {
    for (const part of selector.split(',')) {
      expect(part.trim()).toMatch(/^:root\[data-season="natal"\]:not\(\[data-retro\]\)/)
    }
  }
})

it('never styles a bare footer element', () => {
  expect(selectors.some((s) => /(^|[\s,>])footer\b/.test(s))).toBe(false)
})
