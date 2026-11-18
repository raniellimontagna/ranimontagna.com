import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(
  join(process.cwd(), 'src/shared/components/seasons/programador/programador.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '')

const globalCss = readFileSync(
  join(process.cwd(), 'src/shared/components/seasons/seasons.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '')

/** [classes, attributes and pseudo-classes; elements]: enough for these selectors. */
function specificity(selector: string): [number, number] {
  const middle =
    (selector.match(/\[/g) ?? []).length +
    (selector.match(/\.[a-z]/g) ?? []).length +
    (selector.match(/:(root|first-child|nth-child\([^)]*\))/g) ?? []).length
  const elements = (selector.match(/(^|[\s>])(span|div|p|h1)\b/g) ?? []).length
  return [middle, elements]
}
const beats = (a: [number, number], b: [number, number]) =>
  a[0] > b[0] || (a[0] === b[0] && a[1] > b[1])

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

it('keeps its dialog centered despite the CSS reset', () => {
  const rule = /\.programador-card-dialog\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  expect(rule).toMatch(/margin:\s*auto/)
})

// Each code line keeps its spaces and scrolls inside its own box, never the page.
it('keeps the code as typed and lets a long listing scroll inside itself', () => {
  expect(/\.programador-line-code\s*\{([^}]*)\}/.exec(css)?.[1]).toMatch(/white-space:\s*pre/)
  expect(/\.programador-code\s*\{([^}]*)\}/.exec(css)?.[1]).toMatch(/overflow-x:\s*auto/)
  const line = /\.programador-line\s*\{([^}]*)\}/.exec(css)?.[1]
  expect(line).toMatch(/min-height:\s*44px/)
  // The ok/bug tag never sits over the code: the line grows and the listing scrolls.
  expect(line).toMatch(/min-width:\s*max-content/)
  expect(line).toMatch(/grid-template-columns:[^;]*max-content/)
  expect(line).not.toMatch(/minmax\(0,/)
})

// The listing scrolls, so it clips on both axes: it keeps room for the 3 px ring at 2 px.
it('leaves room inside the listing for the focus ring', () => {
  expect(/\.programador-code\s*\{([^}]*)\}/.exec(css)?.[1]).toMatch(/padding:\s*5px/)
})

// seasons.css paints scheme 0 before the layer loads; a later scheme has to win over it
// whatever order the two sheets end up in.
it('lets every colour scheme win over the pre-paint colours', () => {
  const base = Array.from(
    globalCss.matchAll(/([^{}]+\[data-hero-title\][^{}]*\[data-letter\])\s*\{/g),
    ([, selector]) => specificity(selector.trim()),
  )
  expect(base.length).toBeGreaterThan(0)
  const schemes = selectors.filter((selector) => /\[data-scheme="[12]"\]/.test(selector))
  expect(schemes.length).toBe(3)
  for (const scheme of schemes) {
    for (const rule of base) expect(beats(specificity(scheme), rule), scheme).toBe(true)
  }
})
