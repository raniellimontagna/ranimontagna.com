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
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    lastFrame.current = null
    if (!visible) return

    const interval = FRAME_INTERVAL[mode]
    const renderFrame = (timestamp: number) => {
      if (lastFrame.current === null || timestamp < lastFrame.current) {
        lastFrame.current = timestamp
      } else {
        const elapsed = timestamp - lastFrame.current

        if (elapsed >= interval) {
          lastFrame.current = timestamp - (elapsed % interval)
          advance(timestamp)
        }
      }

      rafId.current = requestAnimationFrame(renderFrame)
    }

    rafId.current = requestAnimationFrame(renderFrame)

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
      rafId.current = null
      lastFrame.current = null
    }
  }, [advance, mode, visible])

  return null
}
