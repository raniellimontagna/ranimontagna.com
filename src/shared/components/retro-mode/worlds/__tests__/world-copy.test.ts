import { getDosCopy } from '../dos/dos-copy'
import { getGameBoyCopy } from '../gameboy/gameboy-copy'
import { getIdeCopy, getIdeFiles } from '../ide/ide-copy'
import { getMacCopy } from '../mac/mac-copy'
import { getNewspaperCopy } from '../newspaper/newspaper-copy'
import { getWeb98Copy } from '../web98/web98-copy'
import { getWorldBio } from '../world-bio'
import { getXpCopy } from '../xp/xp-copy'

const LOCALES = ['pt', 'en', 'es'] as const
const COPIES = {
  dos: getDosCopy,
  gameboy: getGameBoyCopy,
  ide: getIdeCopy,
  mac: getMacCopy,
  newspaper: getNewspaperCopy,
  web98: getWeb98Copy,
  xp: getXpCopy,
}

describe.each(Object.entries(COPIES))('%s copy', (_, getCopy) => {
  it.each(LOCALES)('has every text and every phrase builder in %s', (locale) => {
    const copy = getCopy(locale) as unknown as Record<string, unknown>
    for (const [key, value] of Object.entries(copy)) {
      if (typeof value === 'function') {
        const text = (value as (...args: unknown[]) => unknown)(3, 7)
        expect(typeof text, key).toBe('string')
        expect(String(text).length, key).toBeGreaterThan(0)
      } else {
        expect(value, key).toBeTruthy()
      }
    }
  })

  it('falls back to Portuguese for an unknown locale', () => {
    expect(getCopy('de')).toEqual(getCopy('pt'))
  })
})

it.each(LOCALES)('writes the five IDE files in %s, every link a real destination', (locale) => {
  const files = getIdeFiles(locale)
  expect(files.map((file) => file.route)).toEqual([
    '/',
    '/#about',
    '/projects',
    '/blog',
    '/#contact',
  ])
  const text = files.flatMap((file) => file.lines).join('\n')
  expect(text).toContain(getWorldBio(locale).lead)
  expect(text).toContain('mailto:contato@ranimontagna.com')
  expect(text).toMatch(/https:\/\/wa\.me\//)
})

it('pluralizes item counts', () => {
  expect(getMacCopy('pt').items(1)).toBe('1 item')
  expect(getMacCopy('en').items(2)).toBe('2 items')
  expect(getMacCopy('es').items(1)).toBe('1 elemento')
})
