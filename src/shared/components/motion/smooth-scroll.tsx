'use client'

import 'lenis/dist/lenis.css'
import { createContext, type ReactNode, type RefObject, useContext, useEffect, useRef } from 'react'
import { loadScrollMotion, prefersReducedMotion } from './load-scroll-motion'

const fallbackVelocity: RefObject<number> = { current: 0 }
const ScrollVelocityContext = createContext<RefObject<number>>(fallbackVelocity)

// The live Lenis instance, so overlays (Vega, menus) can pause the page scroll.
let activeLenis: { stop(): void; start(): void } | null = null

/** Pauses smooth scrolling of the page behind an overlay. No-op without Lenis. */
export function stopSmoothScroll(): void {
  activeLenis?.stop()
}

/** Resumes smooth scrolling after an overlay closes. No-op without Lenis. */
export function startSmoothScroll(): void {
  activeLenis?.start()
}

/** Absolute Lenis scroll velocity. Always 0 without Lenis or outside the provider. */
export function useScrollVelocity(): RefObject<number> {
  return useContext(ScrollVelocityContext)
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const velocity = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    Promise.all([import('lenis'), loadScrollMotion()]).then(
      ([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
        if (cancelled) return

        const lenis = new Lenis({
          lerp: 0.09,
          autoRaf: false,
          anchors: true,
          allowNestedScroll: true,
        })
        const raf = (time: number) => lenis.raf(time * 1000)

        lenis.on('scroll', ScrollTrigger.update)
        lenis.on('scroll', (instance) => {
          velocity.current = Math.abs(instance.velocity)
        })
        gsap.ticker.add(raf)
        activeLenis = lenis
        gsap.ticker.lagSmoothing(0)

        cleanup = () => {
          gsap.ticker.remove(raf)
          if (activeLenis === lenis) activeLenis = null
          lenis.destroy()
          velocity.current = 0
        }
      },
    )

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <ScrollVelocityContext.Provider value={velocity}>{children}</ScrollVelocityContext.Provider>
  )
}
