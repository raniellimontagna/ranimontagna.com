import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@/tests/test-utils'

const runtime = vi.hoisted(() => ({
  advance: vi.fn(),
  canvasError: false,
  canvasProps: vi.fn(),
  deferNextCreated: false,
  disposeRenderers: [] as ReturnType<typeof vi.fn>[],
  rendererDebugObjects: [] as Array<{
    onShaderError: ((...args: unknown[]) => void) | null
  }>,
  shaderErrorOnCreate: false,
  environment: {
    palette: { accent: [0.4, 0.2, 0.8], dark: true, ice: [0.7, 0.9, 1] },
    pointerTarget: { current: { x: 0, y: 0 } },
    visible: true,
    zone: 'hero',
  },
  pendingCreated: null as (() => void) | null,
  useFrame: vi.fn(),
}))

vi.mock('@react-three/fiber', async () => {
  const React = await import('react')

  function Canvas(props: { children?: ReactNode; onCreated?: (state: unknown) => void }) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)

    runtime.canvasProps(props)
    if (runtime.canvasError) throw new Error('renderer failed')
    React.useLayoutEffect(() => {
      const notifyCreated = () => {
        const dispose = vi.fn()
        runtime.disposeRenderers.push(dispose)
        const debug: (typeof runtime.rendererDebugObjects)[number] = { onShaderError: null }
        runtime.rendererDebugObjects.push(debug)
        props.onCreated?.({ gl: { debug, dispose, domElement: canvasRef.current } })
        if (runtime.shaderErrorOnCreate) debug.onShaderError?.()
      }

      if (runtime.deferNextCreated) {
        runtime.deferNextCreated = false
        runtime.pendingCreated = notifyCreated
        return
      }

      notifyCreated()
    }, [props.onCreated])

    return React.createElement(
      React.Fragment,
      null,
      React.createElement('canvas', { 'data-testid': 'r3f-canvas', ref: canvasRef }),
      props.children,
    )
  }

  return {
    Canvas,
    useFrame: runtime.useFrame,
    useThree: (selector?: (state: { advance: typeof runtime.advance }) => unknown) => {
      const state = { advance: runtime.advance }
      return selector ? selector(state) : state
    },
  }
})

vi.mock('../spectral-veil-scene', () => ({ SpectralVeilScene: () => null }))
vi.mock('../use-spectral-environment', () => ({
  useSpectralEnvironment: () => runtime.environment,
}))

import { SpectralRenderScheduler } from '../spectral-render-scheduler'
import { FRAGMENT_SHADER, VERTEX_SHADER } from '../spectral-veil.shaders'
import { SpectralVeilCanvas } from '../spectral-veil-canvas'

type RafCallback = (timestamp: number) => void

let nextRafId: number
let rafCallbacks: Map<number, RafCallback>
let cancelAnimationFrameSpy: ReturnType<typeof vi.fn>

function runNextFrame(timestamp: number) {
  const next = rafCallbacks.entries().next().value as [number, RafCallback] | undefined
  expect(next).toBeDefined()
  const [id, callback] = next as [number, RafCallback]
  rafCallbacks.delete(id)
  act(() => callback(timestamp))
}

function runOneSecond(refreshRate: number) {
  for (let frame = 0; frame <= refreshRate; frame += 1) {
    runNextFrame((frame * 1000) / refreshRate)
  }
}

describe('Spectral Veil runtime', () => {
  beforeEach(() => {
    nextRafId = 1
    rafCallbacks = new Map()
    runtime.advance.mockReset()
    runtime.canvasError = false
    runtime.canvasProps.mockReset()
    runtime.deferNextCreated = false
    runtime.disposeRenderers.length = 0
    runtime.rendererDebugObjects.length = 0
    runtime.shaderErrorOnCreate = false
    runtime.environment.visible = true
    runtime.pendingCreated = null
    cancelAnimationFrameSpy = vi.fn((id: number) => rafCallbacks.delete(id))
    vi.stubGlobal('requestAnimationFrame', (callback: RafCallback) => {
      const id = nextRafId
      nextRafId += 1
      rafCallbacks.set(id, callback)
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it.each([
    ['desktop', [1, 1.5]],
    ['mobile', 1],
  ] as const)('uses the bounded %s DPR policy', (mode, expectedDpr) => {
    const { unmount } = render(<SpectralVeilCanvas mode={mode} onPermanentFailure={vi.fn()} />)

    expect(runtime.canvasProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        dpr: expectedDpr,
        frameloop: 'never',
        gl: {
          alpha: true,
          antialias: mode === 'desktop',
          powerPreference: 'low-power',
        },
      }),
    )
    unmount()
  })

  it('fills its shell and disables R3F pointer and touch hit testing', () => {
    const { unmount } = render(<SpectralVeilCanvas mode="desktop" onPermanentFailure={vi.fn()} />)
    const props = runtime.canvasProps.mock.lastCall?.[0]

    expect(screen.getByTestId('spectral-veil-shell')).toHaveClass(
      'absolute',
      'inset-0',
      'h-full',
      'w-full',
    )
    expect(props).toEqual(
      expect.objectContaining({
        style: { height: '100%', pointerEvents: 'none', width: '100%' },
      }),
    )
    expect(props.events({})).toMatchObject({ enabled: false, priority: 0 })
    unmount()
  })

  it.each([
    ['desktop', 45],
    ['mobile', 30],
  ] as const)('never advances %s rendering above %i FPS', (mode, maximumFrames) => {
    const { unmount } = render(<SpectralRenderScheduler mode={mode} visible />)

    runOneSecond(120)

    expect(runtime.advance.mock.calls.length).toBeLessThanOrEqual(maximumFrames)
    unmount()
  })

  it('advances with logical visible time expressed in seconds', () => {
    const { unmount } = render(<SpectralRenderScheduler mode="desktop" visible />)

    runNextFrame(1_000)
    runNextFrame(1_023)
    runNextFrame(1_046)

    expect(runtime.advance).toHaveBeenNthCalledWith(1, 0.023)
    expect(runtime.advance).toHaveBeenNthCalledWith(2, 0.046)
    unmount()
  })

  it('does not schedule while hidden or accumulate hidden time', () => {
    const { rerender, unmount } = render(<SpectralRenderScheduler mode="desktop" visible />)

    runNextFrame(1_000)
    runNextFrame(1_023)
    expect(runtime.advance).toHaveBeenLastCalledWith(0.023)

    rerender(<SpectralRenderScheduler mode="desktop" visible={false} />)
    expect(rafCallbacks).toHaveLength(0)

    rerender(<SpectralRenderScheduler mode="desktop" visible />)
    runNextFrame(100_000)
    expect(runtime.advance).toHaveBeenCalledOnce()
    runNextFrame(100_023)
    expect(runtime.advance).toHaveBeenNthCalledWith(2, 0.046)
    unmount()
  })

  it('cancels its pending animation frame on unmount', () => {
    const { unmount } = render(<SpectralRenderScheduler mode="desktop" visible />)
    const scheduledId = [...rafCallbacks.keys()][0]

    unmount()

    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(scheduledId)
    expect(rafCallbacks).toHaveLength(0)
  })

  it('allows one context restoration before failing permanently', () => {
    const onPermanentFailure = vi.fn()
    const { unmount } = render(
      <SpectralVeilCanvas mode="desktop" onPermanentFailure={onPermanentFailure} />,
    )
    const initialCanvas = screen.getByTestId('r3f-canvas')
    const preventDefault = vi.fn()

    act(() => {
      initialCanvas.dispatchEvent(
        Object.assign(new Event('webglcontextlost', { cancelable: true }), { preventDefault }),
      )
    })
    expect(preventDefault).toHaveBeenCalledOnce()
    expect(initialCanvas.parentElement).toHaveStyle({ opacity: '0' })

    act(() => initialCanvas.dispatchEvent(new Event('webglcontextrestored')))
    const restoredCanvas = screen.getByTestId('r3f-canvas')
    expect(restoredCanvas).not.toBe(initialCanvas)
    expect(restoredCanvas.parentElement).toHaveStyle({ opacity: '1' })

    act(() => {
      restoredCanvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
    })
    expect(onPermanentFailure).toHaveBeenCalledOnce()
    expect(runtime.disposeRenderers[0]).toHaveBeenCalledOnce()

    unmount()
    expect(runtime.disposeRenderers[1]).toHaveBeenCalledOnce()
  })

  it('ignores delayed context loss from the retired canvas during restoration', () => {
    const onPermanentFailure = vi.fn()
    const { unmount } = render(
      <SpectralVeilCanvas mode="desktop" onPermanentFailure={onPermanentFailure} />,
    )
    const initialCanvas = screen.getByTestId('r3f-canvas')

    act(() => initialCanvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })))
    runtime.deferNextCreated = true
    act(() => initialCanvas.dispatchEvent(new Event('webglcontextrestored')))

    const restoredCanvas = screen.getByTestId('r3f-canvas')
    expect(restoredCanvas).not.toBe(initialCanvas)
    expect(runtime.pendingCreated).not.toBeNull()
    expect(runtime.disposeRenderers[0]).toHaveBeenCalledOnce()

    act(() => initialCanvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })))
    expect(onPermanentFailure).not.toHaveBeenCalled()

    act(() => {
      runtime.pendingCreated?.()
      runtime.pendingCreated = null
    })
    act(() => restoredCanvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })))
    expect(onPermanentFailure).toHaveBeenCalledOnce()

    unmount()
  })

  it('keeps the renderer alive when the failure callback identity changes', () => {
    const { rerender, unmount } = render(
      <SpectralVeilCanvas mode="desktop" onPermanentFailure={vi.fn()} />,
    )
    const dispose = runtime.disposeRenderers[0]

    rerender(<SpectralVeilCanvas mode="desktop" onPermanentFailure={vi.fn()} />)

    expect(dispose).not.toHaveBeenCalled()
    unmount()
    expect(dispose).toHaveBeenCalledOnce()
  })

  it('reports renderer errors and disposes the active renderer', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const onPermanentFailure = vi.fn()
    const { rerender } = render(
      <SpectralVeilCanvas mode="desktop" onPermanentFailure={onPermanentFailure} />,
    )
    const dispose = runtime.disposeRenderers[0]

    runtime.canvasError = true
    rerender(<SpectralVeilCanvas mode="mobile" onPermanentFailure={onPermanentFailure} />)

    expect(onPermanentFailure).toHaveBeenCalledOnce()
    expect(dispose).toHaveBeenCalledOnce()
  })

  it('reports shader compile failures once and restores the Three debug hook', () => {
    const onPermanentFailure = vi.fn()
    const { unmount } = render(
      <SpectralVeilCanvas mode="desktop" onPermanentFailure={onPermanentFailure} />,
    )
    const debug = runtime.rendererDebugObjects[0]
    const shaderErrorHandler = debug.onShaderError

    expect(shaderErrorHandler).toBeTypeOf('function')
    act(() => {
      shaderErrorHandler?.()
      shaderErrorHandler?.()
    })

    expect(onPermanentFailure).toHaveBeenCalledOnce()
    expect(runtime.disposeRenderers[0]).toHaveBeenCalledOnce()
    expect(debug.onShaderError).toBeNull()
    unmount()
  })

  it('cleans up a shader failure raised immediately after renderer creation', () => {
    runtime.shaderErrorOnCreate = true
    const onPermanentFailure = vi.fn()

    render(<SpectralVeilCanvas mode="desktop" onPermanentFailure={onPermanentFailure} />)

    expect(onPermanentFailure).toHaveBeenCalledOnce()
    expect(runtime.disposeRenderers[0]).toHaveBeenCalledOnce()
    expect(runtime.rendererDebugObjects[0].onShaderError).toBeNull()
  })

  it('declares every runtime shader uniform', () => {
    for (const uniform of [
      'uTime',
      'uPointer',
      'uAccent',
      'uIce',
      'uIntensity',
      'uMotionScale',
      'uDetail',
    ]) {
      expect(`${VERTEX_SHADER}\n${FRAGMENT_SHADER}`).toContain(uniform)
    }
  })
})
