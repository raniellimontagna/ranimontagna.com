'use client'

import { Canvas, type RootState } from '@react-three/fiber'
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { SpectralVeilCanvasProps } from './spectral-background.types'
import { SpectralRenderScheduler } from './spectral-render-scheduler'
import { SpectralVeilScene } from './spectral-veil-scene'
import { useSpectralEnvironment } from './use-spectral-environment'

type RendererHandle = {
  canvas: HTMLCanvasElement
  gl: RootState['gl']
  release: () => void
}

type SpectralCanvasErrorBoundaryProps = {
  children: ReactNode
  onPermanentFailure: () => void
}

type SpectralCanvasErrorBoundaryState = {
  failed: boolean
}

const EMPTY_RELEASE = () => undefined
const disabledPointerEvents = () => ({ enabled: false, priority: 0 })

class SpectralCanvasErrorBoundary extends Component<
  SpectralCanvasErrorBoundaryProps,
  SpectralCanvasErrorBoundaryState
> {
  state: SpectralCanvasErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): SpectralCanvasErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    this.props.onPermanentFailure()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function SpectralVeilCanvas({ mode, onPermanentFailure }: SpectralVeilCanvasProps) {
  const environment = useSpectralEnvironment(mode)
  const [contextLost, setContextLost] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [renderer, setRenderer] = useState<RendererHandle | null>(null)
  const hasRestored = useRef(false)
  const contextLostRef = useRef(false)
  const failureReported = useRef(false)
  const onPermanentFailureRef = useRef(onPermanentFailure)
  const releaseRendererRef = useRef<() => void>(EMPTY_RELEASE)
  onPermanentFailureRef.current = onPermanentFailure

  const reportPermanentFailure = useCallback(() => {
    if (failureReported.current) return
    failureReported.current = true
    releaseRendererRef.current()
    setContextLost(true)
    setRenderer(null)
    onPermanentFailureRef.current()
  }, [])

  const handleCreated = useCallback(
    ({ gl }: RootState) => {
      const previousOnShaderError = gl.debug.onShaderError
      let released = false
      const release = () => {
        if (released) return
        released = true
        if (gl.debug.onShaderError === reportPermanentFailure) {
          gl.debug.onShaderError = previousOnShaderError
        }
        gl.dispose()
      }

      gl.debug.onShaderError = reportPermanentFailure
      releaseRendererRef.current = release
      setRenderer((current) =>
        current?.gl === gl ? current : { canvas: gl.domElement, gl, release },
      )
    },
    [reportPermanentFailure],
  )

  useEffect(() => {
    if (!renderer) return

    const { canvas, release } = renderer
    let released = false
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      contextLostRef.current = true
      setContextLost(true)

      if (hasRestored.current) reportPermanentFailure()
    }
    const handleContextRestored = () => {
      if (!contextLostRef.current || hasRestored.current || failureReported.current) return

      hasRestored.current = true
      contextLostRef.current = false
      releaseRendererRef.current()
      setRenderer(null)
      setContextLost(false)
      setGeneration((current) => current + 1)
    }
    const releaseRenderer = () => {
      if (released) return
      released = true
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      release()
    }

    releaseRendererRef.current = releaseRenderer

    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    return () => {
      if (releaseRendererRef.current === releaseRenderer) {
        releaseRendererRef.current = EMPTY_RELEASE
      }
      releaseRenderer()
    }
  }, [renderer, reportPermanentFailure])

  return (
    <div
      className="absolute inset-0 h-full w-full"
      data-testid="spectral-veil-shell"
      style={{ opacity: contextLost ? 0 : 1 }}
    >
      <SpectralCanvasErrorBoundary onPermanentFailure={reportPermanentFailure}>
        <Canvas
          dpr={mode === 'mobile' ? 1 : [1, 1.5]}
          events={disabledPointerEvents}
          frameloop="never"
          gl={{
            alpha: true,
            antialias: mode === 'desktop',
            powerPreference: 'low-power',
          }}
          key={generation}
          onCreated={handleCreated}
          style={{ height: '100%', pointerEvents: 'none', width: '100%' }}
        >
          <SpectralVeilScene environment={environment} mode={mode} />
          <SpectralRenderScheduler mode={mode} visible={environment.visible && !contextLost} />
        </Canvas>
      </SpectralCanvasErrorBoundary>
    </div>
  )
}
