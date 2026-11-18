import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(
  join(process.cwd(), 'src/shared/components/seasons/programador/programador.css'),
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
      if (rule.startsWith('.programador')) continue
      expect(rule).toMatch(/^:root\[data-season="programador"\]:not\(\[data-retro\]\)/)
    }
  }
})

// The letters rise in with `transform`: the schemes change colour only.
it('recolours the name with color alone, and the caret blinks softly', () => {
  const schemes = Array.from(css.matchAll(/\[data-scheme[^{]*\{([^}]*)\}/g), ([, body]) => body)
  expect(schemes.length).toBeGreaterThan(0)
  for (const body of schemes) expect(body).not.toMatch(/transform\s*:/)
  const blink = /@keyframes programador-blink\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? ''
  expect(blink).toMatch(/opacity:/)
  expect(css).toMatch(/programador-blink 1\.1s ease-in-out infinite/)
  expect(css).not.toMatch(/steps\(/)
})

// Only inside the no-preference queries does anything blink or fade.
it('moves nothing for visitors who prefer reduced motion', () => {
  const outside = css.replace(
    /@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\n\}/g,
    '',
  )
  expect(outside).not.toMatch(/animation\s*:/)
  expect(outside).not.toMatch(/transition\s*:/)
})
