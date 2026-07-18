'use client'

import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { SpectralMode } from './spectral-background.types'

type SpectralRenderSchedulerProps = {
  mode: Exclude<SpectralMode, 'static'>
  visible: boolean
}

const FRAME_INTERVAL = {
  desktop: 1000 / 45,
  mobile: 1000 / 30,
} as const

export function SpectralRenderScheduler({ mode, visible }: SpectralRenderSchedulerProps) {
  const advance = useThree((state) => state.advance)
  const lastFrame = useRef<number | null>(null)
  const lastRaf = useRef<number | null>(null)
  const logicalTime = useRef(0)
  const pendingVisibleTime = useRef(0)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    lastFrame.current = null
    lastRaf.current = null
    pendingVisibleTime.current = 0
    if (!visible) return

    const interval = FRAME_INTERVAL[mode]
    const renderFrame = (timestamp: number) => {
      if (lastFrame.current === null || lastRaf.current === null || timestamp < lastRaf.current) {
        lastFrame.current = timestamp
        lastRaf.current = timestamp
        pendingVisibleTime.current = 0
      } else {
        pendingVisibleTime.current += timestamp - lastRaf.current
        lastRaf.current = timestamp
        const elapsed = timestamp - lastFrame.current

        if (elapsed >= interval) {
          lastFrame.current = timestamp - (elapsed % interval)
          logicalTime.current += pendingVisibleTime.current / 1000
          pendingVisibleTime.current = 0
          advance(logicalTime.current)
        }
      }

      rafId.current = requestAnimationFrame(renderFrame)
    }

    rafId.current = requestAnimationFrame(renderFrame)

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
      rafId.current = null
      lastFrame.current = null
      lastRaf.current = null
      pendingVisibleTime.current = 0
    }
  }, [advance, mode, visible])

  return null
}
