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

// The slot is held at the game's height before the chunk loads; both must agree.
it('holds the play slot at the same heights as the game', () => {
  const global = readFileSync(
    join(process.cwd(), 'src/shared/components/seasons/seasons.css'),
    'utf8',
  )
  const heights = (text: string, selector: RegExp) =>
    Array.from(
      text.matchAll(new RegExp(`${selector.source}\\s*\\{[^}]*?min-height:\\s*([\\d.]+rem)`, 'g')),
      (m) => m[1],
    )
  const slot = heights(
    global,
    /\[data-season="reveillon"\]:not\(\[data-retro\]\) \[data-season-slot="play"\]/,
  )
  const game = heights(css, /\.reveillon-sea/)
  expect(slot).toEqual(['30rem', '26rem'])
  expect(game).toEqual(slot)
})
