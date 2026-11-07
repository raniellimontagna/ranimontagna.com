import { readFileSync } from 'node:fs'

// Spec §6: flat colors, no decorative gradient. The 2025 site painted ambient
// radial gradients behind every page from the body rule.
it('paints the page background flat, without decorative gradients', () => {
  const css = readFileSync('src/app/[locale]/globals.css', 'utf8')
  const body = /\nbody\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  expect(body).toContain('background')
  expect(body).not.toMatch(/gradient/)
})
