import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(
  join(process.cwd(), 'src/shared/components/seasons/reveillon/reveillon.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '')

const selectors = Array.from(css.matchAll(/([^{}]+)\{/g), ([, selector]) => selector.trim())
  .filter((selector) => !selector.startsWith('@'))
  .filter((selector) => !/^(from|to|[\d.,%\s]+)$/.test(selector))

// The chunk's stylesheet stays loaded after the season is turned off or a retro world
// opens: only the layer's own classes may go ungated.
it('gates every rule on page elements outside the layer by the season attribute', () => {
  expect(selectors.length).toBeGreaterThan(0)
  for (const selector of selectors) {
    for (const part of selector.split(',')) {
      const rule = part.trim()
      if (rule.startsWith('.reveillon')) continue
      expect(rule).toMatch(/^:root\[data-season="reveillon"\]:not\(\[data-retro\]\)/)
    }
  }
})

// Tailwind's preflight sets margin: 0 on every element; a modal <dialog> centers with auto.
it('keeps its dialogs centered despite the CSS reset', () => {
  for (const [, rule] of css.matchAll(/\.reveillon-[\w-]*dialog\s*\{([^}]*)\}/g)) {
    expect(rule).toMatch(/margin:\s*auto/)
  }
})
