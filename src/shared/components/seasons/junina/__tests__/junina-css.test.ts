import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (path: string) =>
  readFileSync(join(process.cwd(), path), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const css = read('src/shared/components/seasons/junina/junina.css')
const global = read('src/shared/components/seasons/seasons.css')

const selectors = Array.from(css.matchAll(/([^{}]+)\{/g), ([, selector]) => selector.trim())
  .filter((selector) => !selector.startsWith('@'))
  .filter((selector) => !/^(from|to|[\d.,%\s]+)$/.test(selector))

it('gates every rule on page elements outside the layer by the season attribute', () => {
  expect(selectors.length).toBeGreaterThan(0)
  for (const selector of selectors) {
    for (const part of selector.split(',')) {
      const rule = part.trim().replace(/\s+/g, ' ')
      if (rule.startsWith('.junina')) continue
      expect(rule).toMatch(/^:root\[data-season="junina"\]:not\(\[data-retro\]\)/)
    }
  }
})

it('keeps its dialog centered despite the CSS reset', () => {
  const rule = /\.junina-card-dialog\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  expect(rule).toMatch(/margin:\s*auto/)
})

it('holds the play slot at the same heights as the game', () => {
  const heights = (text: string, selector: RegExp) =>
    Array.from(
      text.matchAll(new RegExp(`${selector.source}\\s*\\{[^}]*?min-height:\\s*([\\d.]+rem)`, 'g')),
      (m) => m[1],
    )
  const slot = heights(
    global,
    /\[data-season="junina"\]:not\(\[data-retro\]\) \[data-season-slot="play"\]/,
  )
  expect(slot).toEqual(['34rem', '30rem'])
  expect(heights(css, /\.junina-pescaria/)).toEqual(slot)
})
