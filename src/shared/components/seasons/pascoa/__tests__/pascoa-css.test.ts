import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (path: string) =>
  readFileSync(join(process.cwd(), path), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const css = read('src/shared/components/seasons/pascoa/pascoa.css')
const global = read('src/shared/components/seasons/seasons.css')
const page = read('src/app/[locale]/globals.css')

const selectors = Array.from(css.matchAll(/([^{}]+)\{/g), ([, selector]) => selector.trim())
  .filter((selector) => !selector.startsWith('@'))
  .filter((selector) => !/^(from|to|[\d.,%\s]+)$/.test(selector))

it('gates every rule on page elements outside the layer by the season attribute', () => {
  expect(selectors.length).toBeGreaterThan(0)
  for (const selector of selectors) {
    for (const part of selector.split(',')) {
      const rule = part.trim().replace(/\s+/g, ' ')
      if (rule.startsWith('.pascoa')) continue
      expect(rule).toMatch(/^:root\[data-season="pascoa"\]:not\(\[data-retro\]\)/)
    }
  }
})

it('keeps its dialogs centered despite the CSS reset', () => {
  for (const [, rule] of css.matchAll(/\.pascoa-[\w-]*dialog\s*\{([^}]*)\}/g)) {
    expect(rule).toMatch(/margin:\s*auto/)
  }
})

// WCAG relative luminance and contrast, for the paint on the name (large text: 3:1).
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const block = (text: string, selector: string) => text.slice(text.indexOf(selector)).split('}')[0]
const paints = (text: string) =>
  Array.from(text.matchAll(/--season-paint-\d:\s*(#[0-9a-f]{6})/gi), (m) => m[1])

it('paints the name readable on both themes', () => {
  const light = paints(block(global, ':root[data-season="pascoa"]:not([data-retro]) {'))
  const dark = paints(block(global, ':root[data-season="pascoa"]:not([data-retro]).dark {'))
  const lightBg = /--background:\s*(#[0-9a-f]{6})/i.exec(block(page, ':root {'))?.[1] ?? ''
  const darkBg = /--background:\s*(#[0-9a-f]{6})/i.exec(block(page, '.dark {'))?.[1] ?? ''
  expect(light).toHaveLength(4)
  expect(dark).toHaveLength(4)
  for (const color of light) expect(contrast(color, lightBg)).toBeGreaterThanOrEqual(3)
  for (const color of dark) expect(contrast(color, darkBg)).toBeGreaterThanOrEqual(3)
})

// The background shorthand resets background-clip, which would paint the whole box.
it('paints with longhands, so the clip to the glyphs holds', () => {
  const rules = [
    ...css.matchAll(/data-pintura[^{]*\{([^}]*)\}/g),
    ...global.matchAll(/data-season="pascoa"[^{]*data-letter[^{]*\{([^}]*)\}/g),
  ]
  expect(rules.length).toBeGreaterThan(3)
  for (const [, body] of rules) expect(body).not.toMatch(/(^|[;\s])background\s*:/)
})

it('paints the name before the layer loads, so it never flashes plain', () => {
  const base =
    /data-season="pascoa"\]:not\(\[data-retro\]\) \[data-hero-title\] \[data-letter\] \{([^}]*)\}/.exec(
      global,
    )?.[1] ?? ''
  expect(base).toMatch(/background-clip:\s*text/)
  expect(base).toMatch(/padding:\s*0\.2em 0\.1em/)
})

it('never lets the bunny take a click', () => {
  const strip = /\.pascoa-bunny-strip\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  expect(strip).toMatch(/pointer-events:\s*none/)
})

// The fixed corner would cover the footer's last line and links at the end of the page.
it('makes room under the footer while the hunt corner is shown', () => {
  expect(css).toMatch(
    /:root\[data-season="pascoa"\]:not\(\[data-retro\]\):has\(\.pascoa-hunt-bar\) \[data-site-footer\]\s*\{[^}]*padding-bottom/,
  )
})
