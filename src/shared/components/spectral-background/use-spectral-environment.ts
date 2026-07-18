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
const INTERSECTION_THRESHOLDS = Array.from({ length: 11 }, (_, index) => index / 10)

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
    const mutationObserver =
      typeof MutationObserver === 'undefined' ? null : new MutationObserver(updatePalette)

    mutationObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-color-theme', 'style'],
    })
    document.addEventListener('visibilitychange', updateVisibility)
    if (mode === 'desktop') window.addEventListener('pointermove', updatePointer, { passive: true })

    return () => {
      mutationObserver?.disconnect()
      document.removeEventListener('visibilitychange', updateVisibility)
      window.removeEventListener('pointermove', updatePointer)
    }
  }, [mode])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const candidates = new Map<Element, ZoneCandidate>()
    const observedMarkers = new Set<Element>()
    const updateZone = () => {
      setZone(
        selectSpectralZone(
          [...candidates.values()].filter((candidate) => candidate.intersectionRatio > 0),
        ),
      )
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!observedMarkers.has(entry.target)) continue

          const zone = entry.target.getAttribute('data-spectral-zone')

          if (!isSpectralZone(zone)) {
            candidates.delete(entry.target)
            continue
          }

          candidates.set(entry.target, {
            zone,
            intersectionRatio: entry.intersectionRatio,
            centerDistance: getCenterDistance(entry.boundingClientRect),
          })
        }

        updateZone()
      },
      { threshold: INTERSECTION_THRESHOLDS },
    )
    const reconcileMarkers = () => {
      const currentMarkers = new Set<Element>()

      document.querySelectorAll('[data-spectral-zone]').forEach((marker) => {
        if (isSpectralZone(marker.getAttribute('data-spectral-zone'))) currentMarkers.add(marker)
      })

      for (const marker of observedMarkers) {
        if (currentMarkers.has(marker)) continue

        observer.unobserve(marker)
        observedMarkers.delete(marker)
        candidates.delete(marker)
      }

      for (const marker of currentMarkers) {
        if (observedMarkers.has(marker)) continue

        observedMarkers.add(marker)
        observer.observe(marker)
      }

      updateZone()
    }
    const mutationObserver =
      typeof MutationObserver === 'undefined' ? null : new MutationObserver(reconcileMarkers)

    mutationObserver?.observe(document.body, { childList: true, subtree: true })
    reconcileMarkers()

    return () => {
      mutationObserver?.disconnect()
      observer.disconnect()
      observedMarkers.clear()
      candidates.clear()
    }
  }, [])

  return { zone, palette, visible, pointerTarget }
}
