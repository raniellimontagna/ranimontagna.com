'use client'

import { useCallback, useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { isSoundOn, onSoundChange, setSoundOn } from './world-sound'

/** The time of day for a taskbar or menu bar, refreshed every 15 seconds. */
export function useWorldClock(locale: string, options?: Intl.DateTimeFormatOptions) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  if (!now) return ''
  return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : locale, {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(now)
}

/**
 * A boot sequence that plays once per session and world. It never plays with
 * reduced motion, and `replay` brings it back (Restart, a power button).
 */
export function useBootOnce(world: string) {
  const key = `retro-booted-${world}`
  const [booting, setBooting] = useState(false)
  // False until the first effect decides whether to boot, so nothing jumps the gun.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(key) === '1'
    } catch {
      seen = false
    }
    if (!seen && !prefersReducedMotion()) setBooting(true)
    setReady(true)
  }, [key])

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(key, '1')
    } catch {
      // Without storage the boot simply plays again next time.
    }
    setBooting(false)
  }, [key])

  const replay = useCallback(() => {
    if (!prefersReducedMotion()) setBooting(true)
  }, [])

  return { booting, ready, finish, replay }
}

/** The shared sound switch, in sync across every world on the page. */
export function useWorldSound() {
  const [on, setOn] = useState(true)
  useEffect(() => {
    setOn(isSoundOn())
    return onSoundChange(setOn)
  }, [])
  const toggle = useCallback(() => setSoundOn(!isSoundOn()), [])
  return { on, toggle }
}

/** Calls `onDone` after `ms`, skippable by any key or click. Cleans up after itself. */
export function useSkippableTimer(active: boolean, ms: number, onDone: () => void) {
  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(onDone, ms)
    const skip = (event: Event) => {
      if (event instanceof KeyboardEvent && ['Shift', 'Control', 'Alt', 'Meta'].includes(event.key))
        return
      onDone()
    }
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [active, ms, onDone])
}
