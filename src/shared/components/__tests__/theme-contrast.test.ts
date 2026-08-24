import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'src/app/[locale]/globals.css'), 'utf8')

const themes = [
  'default',
  'ocean',
  'rose',
  'emerald',
  'amber',
  'violet',
  'mono',
  'sunset',
  'cherry',
]

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readTokens(selector: string) {
  const match = css.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([\\s\\S]*?)\\n\\}`))
  if (!match) throw new Error(`Missing CSS token block: ${selector}`)

  return Object.fromEntries(
    [...match[1].matchAll(/--([a-z-]+):\s*(#[\da-f]{6})\s*;/gi)].map((token) => [
      token[1],
      token[2].toLowerCase(),
    ]),
  )
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  )
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )

  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function contrast(first: string, second: string) {
  const firstLuminance = luminance(first)
  const secondLuminance = luminance(second)

  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  )
}

describe('theme contrast tokens', () => {
  const lightBase = readTokens(':root')
  const darkBase = readTokens('.dark')

  it.each(themes)('%s light palette meets text and focus contrast', (theme) => {
    const ownTokens =
      theme === 'default' ? lightBase : readTokens(`:root[data-color-theme="${theme}"]`)
    const tokens = { ...lightBase, ...ownTokens }

    expect(ownTokens['on-accent']).toMatch(/^#[\da-f]{6}$/)
    expect(ownTokens['focus-ring']).toMatch(/^#[\da-f]{6}$/)
    expect(contrast(tokens['on-accent'], tokens.accent)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(tokens.secondary, tokens.background)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(tokens['focus-ring'], tokens.background)).toBeGreaterThanOrEqual(3)
    expect(contrast(tokens['focus-ring'], tokens['surface-strong'])).toBeGreaterThanOrEqual(3)
  })

  it.each(themes)('%s dark palette meets text and focus contrast', (theme) => {
    const ownTokens =
      theme === 'default' ? darkBase : readTokens(`:root[data-color-theme="${theme}"].dark`)
    const tokens = { ...darkBase, ...ownTokens }

    expect(ownTokens['on-accent']).toMatch(/^#[\da-f]{6}$/)
    expect(ownTokens['focus-ring']).toMatch(/^#[\da-f]{6}$/)
    expect(contrast(tokens['on-accent'], tokens.accent)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(tokens['on-accent'], tokens['accent-ice'])).toBeGreaterThanOrEqual(4.5)
    expect(contrast(tokens.secondary, tokens.background)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(tokens['focus-ring'], tokens.background)).toBeGreaterThanOrEqual(3)
    expect(contrast(tokens['focus-ring'], tokens['surface-strong'])).toBeGreaterThanOrEqual(3)
  })
})
