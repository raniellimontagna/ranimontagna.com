'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  SpectralEnvironment,
  SpectralMode,
  SpectralPoint,
  SpectralZone,
  ZoneCandidate,
} from './spectral-background.types'
import { readSpectralPalette, selectSpectralZone } from './spectral-background.utils'

const SPECTRAL_ZONES: readonly SpectralZone[] = ['hero', 'balanced', 'quiet', 'focus']

function isSpectralZone(value: string | null): value is SpectralZone {
  return value !== null && SPECTRAL_ZONES.includes(value as SpectralZone)
}

function getCenterDistance(rect: DOMRectReadOnly) {
  return Math.hypot(
    rect.left + rect.width / 2 - window.innerWidth / 2,
    rect.top + rect.height / 2 - window.innerHeight / 2,
  )
}

export function useSpectralEnvironment(mode: Exclude<SpectralMode, 'static'>): SpectralEnvironment {
  const pointerTarget = useRef<SpectralPoint>({ x: 0, y: 0 })
  const [zone, setZone] = useState<SpectralZone>('quiet')
  const [palette, setPalette] = useState(() => readSpectralPalette(document.documentElement))
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible')

  useEffect(() => {
    const updatePalette = () => setPalette(readSpectralPalette(document.documentElement))
    const updateVisibility = () => setVisible(document.visibilityState === 'visible')
    const updatePointer = (event: PointerEvent) => {
      pointerTarget.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointerTarget.current.y = 1 - (event.clientY / window.innerHeight) * 2
    }
    const mutationObserver = new MutationObserver(updatePalette)

    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-color-theme', 'style'],
    })
    document.addEventListener('visibilitychange', updateVisibility)
    if (mode === 'desktop') window.addEventListener('pointermove', updatePointer, { passive: true })

    return () => {
      mutationObserver.disconnect()
      document.removeEventListener('visibilitychange', updateVisibility)
      window.removeEventListener('pointermove', updatePointer)
    }
  }, [mode])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const candidates = new Map<Element, ZoneCandidate>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const zone = entry.target.getAttribute('data-spectral-zone')

        if (!isSpectralZone(zone)) continue

        candidates.set(entry.target, {
          zone,
          intersectionRatio: entry.intersectionRatio,
          centerDistance: getCenterDistance(entry.boundingClientRect),
        })
      }

      setZone(
        selectSpectralZone(
          [...candidates.values()].filter((candidate) => candidate.intersectionRatio > 0),
        ),
      )
    })

    document.querySelectorAll('[data-spectral-zone]').forEach((marker) => {
      observer.observe(marker)
    })

    return () => observer.disconnect()
  }, [])

  return { zone, palette, visible, pointerTarget }
}
