'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { useSkippableTimer } from '../world-hooks'
import type { XpCopy } from './xp-copy'
import { StartSymbol } from './xp-icons'

function Wordmark() {
  return (
    <p className="xp-wordmark">
      <StartSymbol />
      <span>
        Ranielli <strong>Montagna</strong>
        <sup>xp</sup>
      </span>
    </p>
  )
}

/**
 * Black boot screen with the sliding loader, then the welcome screen with his
 * user tile. Any key or click skips ahead; the desktop is already behind it.
 */
export function XpBoot({
  copy,
  startAt = 'boot',
  onDone,
}: {
  copy: XpCopy
  startAt?: 'boot' | 'welcome'
  onDone: () => void
}) {
  const [phase, setPhase] = useState<'boot' | 'welcome'>(startAt)
  const toWelcome = useCallback(() => setPhase('welcome'), [])
  useSkippableTimer(phase === 'boot', 2600, toWelcome)
  useSkippableTimer(phase === 'welcome', 2200, onDone)

  return (
    <div className={`xp-fullscreen xp-boot xp-boot-${phase}`} aria-hidden="true">
      {phase === 'boot' ? (
        <>
          <Wordmark />
          <div className="xp-loader">
            <i />
            <i />
            <i />
          </div>
          <p className="xp-boot-copyright">© Ranielli Montagna</p>
        </>
      ) : (
        <div className="xp-welcome">
          <div className="xp-welcome-left">
            <Wordmark />
            <p>{copy.clickName}</p>
          </div>
          <div className="xp-welcome-divider" />
          <div className="xp-welcome-right">
            <span className="xp-user-tile">
              <Image src="/images/avatar-112.webp" alt="" width={56} height={56} />
              <span>Ranielli</span>
            </span>
          </div>
          <p className="xp-welcome-word">{copy.welcome}</p>
        </div>
      )}
      <span className="xp-boot-skip">{copy.skip} ›</span>
    </div>
  )
}

/** "Saving your settings..." on the blue screen, then whatever comes next. */
export function XpSaving({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1800)
    return () => window.clearTimeout(timer)
  }, [onDone])
  return (
    <div className="xp-fullscreen xp-saving" role="status">
      <Wordmark />
      <p>{text}</p>
    </div>
  )
}

/** Stand By: a screensaver that wanders until a key or click wakes the desktop. */
export function XpStandBy({ hint, onWake }: { hint: string; onWake: () => void }) {
  useEffect(() => {
    // Ignore the click that chose Stand By.
    const arm = window.setTimeout(() => {
      window.addEventListener('keydown', onWake, { once: true })
      window.addEventListener('pointerdown', onWake, { once: true })
    }, 300)
    return () => {
      window.clearTimeout(arm)
      window.removeEventListener('keydown', onWake)
      window.removeEventListener('pointerdown', onWake)
    }
  }, [onWake])
  return (
    <div className="xp-fullscreen xp-standby" role="status" aria-label={hint}>
      <div className="xp-standby-logo">
        <Wordmark />
      </div>
      <p className="sr-only">{hint}</p>
    </div>
  )
}
