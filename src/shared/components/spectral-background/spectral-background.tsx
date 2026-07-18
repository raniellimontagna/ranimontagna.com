'use client'

import { type ComponentType, useEffect, useRef, useState } from 'react'
import type { SpectralMode, SpectralVeilCanvasProps } from './spectral-background.types'
import { resolveSpectralMode, supportsWebGl } from './spectral-background.utils'
import { SpectralFallback } from './spectral-fallback'

export type SpectralCanvasLoader = () => Promise<{
  SpectralVeilCanvas: ComponentType<SpectralVeilCanvasProps>
}>

const loadSpectralCanvas: SpectralCanvasLoader = () =>
  import('./spectral-veil-canvas') as ReturnType<SpectralCanvasLoader>

type SpectralBackgroundProps = {
  canvasLoader?: SpectralCanvasLoader
}

export function SpectralBackground({ canvasLoader = loadSpectralCanvas }: SpectralBackgroundProps) {
  const [mode, setMode] = useState<SpectralMode>('static')
  const [CanvasComponent, setCanvasComponent] =
    useState<ComponentType<SpectralVeilCanvasProps> | null>(null)
  const [permanentFailure, setPermanentFailure] = useState(false)
  const hasAttemptedLoad = useRef(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    let frame: number | null = null

    const updateMode = () => {
      setMode(
        resolveSpectralMode({
          reducedMotion: reducedMotion.matches,
          webgl: supportsWebGl(document),
          coarsePointer: coarsePointer.matches,
          width: window.innerWidth,
        }),
      )
    }
    const queueModeUpdate = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        updateMode()
      })
    }

    updateMode()
    reducedMotion.addEventListener('change', queueModeUpdate)
    coarsePointer.addEventListener('change', queueModeUpdate)
    window.addEventListener('resize', queueModeUpdate)

    return () => {
      reducedMotion.removeEventListener('change', queueModeUpdate)
      coarsePointer.removeEventListener('change', queueModeUpdate)
      window.removeEventListener('resize', queueModeUpdate)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (mode === 'static' || CanvasComponent || permanentFailure || hasAttemptedLoad.current) return

    hasAttemptedLoad.current = true
    let isMounted = true

    canvasLoader()
      .then(({ SpectralVeilCanvas }) => {
        if (isMounted) setCanvasComponent(() => SpectralVeilCanvas)
      })
      .catch(() => undefined)

    return () => {
      isMounted = false
    }
  }, [CanvasComponent, canvasLoader, mode, permanentFailure])

  return (
    <div aria-hidden="true" className="spectral-background" data-testid="spectral-background">
      <SpectralFallback />
      {CanvasComponent && mode !== 'static' && !permanentFailure ? (
        <div className="spectral-canvas-shell">
          <CanvasComponent mode={mode} onPermanentFailure={() => setPermanentFailure(true)} />
        </div>
      ) : null}
    </div>
  )
}
