import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  parseCssColor,
  resolveSpectralMode,
  selectSpectralZone,
  shouldActivateSpectral,
  supportsWebGl,
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

describe('shouldActivateSpectral', () => {
  it.each([
    [{ pathname: '/en', saveData: false, deviceMemory: 8, hardwareConcurrency: 8 }, true],
    [{ pathname: '/pt/projects', saveData: false, deviceMemory: 4, hardwareConcurrency: 4 }, true],
    [
      {
        pathname: '/es/blog/post',
        saveData: false,
        deviceMemory: undefined,
        hardwareConcurrency: 8,
      },
      true,
    ],
    [{ pathname: '/en/unknown', saveData: false, deviceMemory: 8, hardwareConcurrency: 8 }, false],
    [{ pathname: '/en', saveData: true, deviceMemory: 8, hardwareConcurrency: 8 }, false],
    [{ pathname: '/en', saveData: false, deviceMemory: 2, hardwareConcurrency: 8 }, false],
    [{ pathname: '/en', saveData: false, deviceMemory: 8, hardwareConcurrency: 2 }, false],
  ] as const)('maps %o to %s', (input, expected) => {
    expect(shouldActivateSpectral(input)).toBe(expected)
  })
})

describe('supportsWebGl', () => {
  const RENDERER = 0x1f01
  const UNMASKED_RENDERER = 0x9246

  function mockCanvas(context: unknown) {
    const getContext = vi.fn(() => context)
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockReturnValue({ getContext } as unknown as HTMLCanvasElement)

    return { createElement, getContext }
  }

  function createContext(renderer: string, { debugInfo = true } = {}) {
    const loseContext = vi.fn()

    return {
      loseContext,
      context: {
        RENDERER,
        getExtension: vi.fn((name: string) => {
          if (name === 'WEBGL_debug_renderer_info')
            return debugInfo ? { UNMASKED_RENDERER_WEBGL: UNMASKED_RENDERER } : null
          if (name === 'WEBGL_lose_context') return { loseContext }
          return null
        }),
        getParameter: vi.fn((parameter: number) =>
          parameter === UNMASKED_RENDERER || parameter === RENDERER ? renderer : null,
        ),
      },
    }
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('requires WebGL2 without a major performance caveat', () => {
    const { createElement, getContext } = mockCanvas(null)

    expect(supportsWebGl(document)).toBe(false)
    expect(createElement).toHaveBeenCalledWith('canvas')
    expect(getContext).toHaveBeenCalledOnce()
    expect(getContext).toHaveBeenCalledWith('webgl2', { failIfMajorPerformanceCaveat: true })
  })

  it('accepts a hardware renderer and releases the probe context', () => {
    const { context, loseContext } = createContext('ANGLE (NVIDIA GeForce RTX 3060)')
    mockCanvas(context)

    expect(supportsWebGl(document)).toBe(true)
    expect(loseContext).toHaveBeenCalledOnce()
  })

  it.each([
    'Google SwiftShader',
    'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)',
    'llvmpipe (LLVM 15.0.7, 256 bits)',
    'Microsoft Basic Render Driver (Software)',
  ])('rejects the software renderer %s', (renderer) => {
    const { context } = createContext(renderer)
    mockCanvas(context)

    expect(supportsWebGl(document)).toBe(false)
  })

  it('falls back to the masked renderer when debug info is unavailable', () => {
    const { context } = createContext('SwiftShader', { debugInfo: false })
    mockCanvas(context)

    expect(supportsWebGl(document)).toBe(false)
    expect(context.getParameter).toHaveBeenCalledWith(RENDERER)
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
