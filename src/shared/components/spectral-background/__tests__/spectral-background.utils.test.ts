import { describe, expect, it } from 'vitest'
import {
  parseCssColor,
  resolveSpectralMode,
  selectSpectralZone,
} from '../spectral-background.utils'

describe('resolveSpectralMode', () => {
  it.each([
    [{ reducedMotion: true, webgl: true, coarsePointer: false, width: 1440 }, 'static'],
    [{ reducedMotion: false, webgl: false, coarsePointer: false, width: 1440 }, 'static'],
    [{ reducedMotion: false, webgl: true, coarsePointer: true, width: 1440 }, 'mobile'],
    [{ reducedMotion: false, webgl: true, coarsePointer: false, width: 767 }, 'mobile'],
    [{ reducedMotion: false, webgl: true, coarsePointer: false, width: 1440 }, 'desktop'],
  ] as const)('maps %o to %s', (input, expected) => {
    expect(resolveSpectralMode(input)).toBe(expected)
  })
})

describe('parseCssColor', () => {
  it('normalizes supported CSS colors and rejects invalid input', () => {
    expect(parseCssColor('#0f8')).toEqual([0, 1, 136 / 255])
    expect(parseCssColor('#336699')).toEqual([0.2, 0.4, 0.6])
    expect(parseCssColor('rgb(51 102 153)')).toEqual([0.2, 0.4, 0.6])
    expect(parseCssColor('rgb(51, 102, 153)')).toEqual([0.2, 0.4, 0.6])
    expect(parseCssColor('not-a-color')).toBeNull()
  })
})

describe('selectSpectralZone', () => {
  it('uses visible area first and viewport-center distance second', () => {
    expect(selectSpectralZone([])).toBe('quiet')
    expect(
      selectSpectralZone([
        { zone: 'hero', intersectionRatio: 0.5, centerDistance: 300 },
        { zone: 'balanced', intersectionRatio: 0.7, centerDistance: 500 },
      ]),
    ).toBe('balanced')
    expect(
      selectSpectralZone([
        { zone: 'hero', intersectionRatio: 0.7, centerDistance: 300 },
        { zone: 'focus', intersectionRatio: 0.7, centerDistance: 100 },
      ]),
    ).toBe('focus')
  })
})
