'use client'

import { type ComponentType, useEffect, useRef, useState } from 'react'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import type { SpectralMode, SpectralVeilCanvasProps } from './spectral-background.types'
import {
  resolveSpectralMode,
  shouldActivateSpectral,
  supportsWebGl,
} from './spectral-background.utils'
import { SpectralFallback } from './spectral-fallback'

export type SpectralCanvasLoader = () => Promise<{
  SpectralVeilCanvas: ComponentType<SpectralVeilCanvasProps>
}>

const loadSpectralCanvas: SpectralCanvasLoader = () =>
  import('./spectral-veil-canvas') as ReturnType<SpectralCanvasLoader>

type SpectralBackgroundProps = {
  canvasLoader?: SpectralCanvasLoader
  pathname?: string
  activationScheduler?: (callback: () => void) => () => void
}

const ACTIVATION_EVENTS = [
  'pointermove',
  'pointerdown',
  'touchstart',
  'wheel',
  'scroll',
  'keydown',
] as const

/**
 * The WebGL chunk (three.js + R3F) is only requested after the first real
 * interaction. No timer or idle fallback: a visitor that never interacts, such
 * as a lab audit, keeps the CSS fallback and never downloads the chunk.
 */
function scheduleCanvasActivation(callback: () => void) {
  const removeListeners = () => {
    for (const eventName of ACTIVATION_EVENTS) window.removeEventListener(eventName, activate)
  }
  function activate() {
    removeListeners()
    callback()
  }

  for (const eventName of ACTIVATION_EVENTS) {
    window.addEventListener(eventName, activate, { once: true, passive: true })
  }

  return removeListeners
}

export function SpectralBackground({
  canvasLoader = loadSpectralCanvas,
  pathname,
  activationScheduler = scheduleCanvasActivation,
}: SpectralBackgroundProps) {
  const retroActive = useRetroMode((state) => state.active)
  const [mode, setMode] = useState<SpectralMode>('static')
  const [activationReady, setActivationReady] = useState(false)
  const [CanvasComponent, setCanvasComponent] =
    useState<ComponentType<SpectralVeilCanvasProps> | null>(null)
  const [permanentFailure, setPermanentFailure] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const canvasLoadPromise = useRef<ReturnType<SpectralCanvasLoader> | null>(null)
  const webGlSupport = useRef<boolean | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    let frame: number | null = null

    const updateMode = () => {
      const navigatorWithHints = navigator as Navigator & {
        connection?: { saveData?: boolean }
        deviceMemory?: number
      }
      const canActivate = shouldActivateSpectral({
        pathname: pathname ?? window.location.pathname,
        saveData: navigatorWithHints.connection?.saveData === true,
        deviceMemory: navigatorWithHints.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
      })

      if (!canActivate) {
        setMode('static')
        return
      }

      // WebGL is probed lazily after activation; until then only a known
      // failure keeps the background static.
      setMode(
        resolveSpectralMode({
          reducedMotion: reducedMotion.matches,
          webgl: webGlSupport.current !== false,
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
  }, [pathname])

  useEffect(() => {
    if (retroActive || mode === 'static' || permanentFailure || activationReady) return

    return activationScheduler(() => setActivationReady(true))
  }, [activationReady, activationScheduler, mode, permanentFailure, retroActive])

  useEffect(() => {
    if (retroActive || !activationReady || mode === 'static' || CanvasComponent || permanentFailure)
      return

    webGlSupport.current ??= supportsWebGl(document)
    if (!webGlSupport.current) {
      setPermanentFailure(true)
      return
    }

    let isMounted = true
    canvasLoadPromise.current ??= canvasLoader()

    canvasLoadPromise.current
      .then(({ SpectralVeilCanvas }) => {
        if (isMounted) setCanvasComponent(() => SpectralVeilCanvas)
      })
      .catch(() => undefined)

    return () => {
      isMounted = false
    }
  }, [CanvasComponent, activationReady, canvasLoader, mode, permanentFailure, retroActive])

  const showCanvas = !retroActive && CanvasComponent !== null && mode !== 'static' && !permanentFailure

  useEffect(() => {
    if (!showCanvas) setCanvasReady(false)
  }, [showCanvas])

  return (
    <div aria-hidden="true" className="spectral-background" data-testid="spectral-background">
      <SpectralFallback />
      {showCanvas && CanvasComponent ? (
        <div className="spectral-canvas-shell" data-ready={canvasReady ? 'true' : 'false'}>
          <CanvasComponent
            mode={mode}
            onPermanentFailure={() => setPermanentFailure(true)}
            onReady={() => setCanvasReady(true)}
          />
        </div>
      ) : null}
    </div>
  )
}
