'use client'

import { useEffect, useState } from 'react'
import { useSkippableTimer } from '../world-hooks'
import { playTones, type Tone } from '../world-sound'
import type { MacCopy } from './mac-copy'
import { MacIcon, type MacIconKind, SmilingComputer } from './mac-icons'

/** An original major chord, rolled from the bottom up. */
const CHORD: Tone[] = [
  { f: 130.81, at: 0, d: 1.8, type: 'triangle', v: 0.06 },
  { f: 196, at: 0.01, d: 1.8, type: 'triangle', v: 0.05 },
  { f: 261.63, at: 0.02, d: 1.8, type: 'triangle', v: 0.05 },
  { f: 329.63, at: 0.03, d: 1.7, type: 'triangle', v: 0.04 },
  { f: 392, at: 0.04, d: 1.6, type: 'triangle', v: 0.035 },
  { f: 523.25, at: 0.05, d: 1.5, v: 0.03 },
]

const EXTENSIONS: MacIconKind[] = ['disk', 'folder', 'document', 'app', 'trash', 'computer']

/** Gray screen, the chord, the smiling computer, then the welcome box with its extensions. */
export function MacBoot({ copy, onDone }: { copy: MacCopy; onDone: () => void }) {
  const [phase, setPhase] = useState<'face' | 'welcome'>('face')
  const [loaded, setLoaded] = useState(0)
  useSkippableTimer(true, 3600, onDone)

  useEffect(() => {
    const stop = playTones(CHORD)
    const welcome = window.setTimeout(() => setPhase('welcome'), 1300)
    const icons = EXTENSIONS.map((_, index) =>
      window.setTimeout(() => setLoaded(index + 1), 1600 + index * 280),
    )
    return () => {
      stop()
      window.clearTimeout(welcome)
      for (const timer of icons) window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="mac-boot" aria-hidden="true">
      {phase === 'face' ? (
        <SmilingComputer />
      ) : (
        <>
          <div className="mac-boot-welcome">
            <SmilingComputer />
            <p>{copy.welcome}</p>
            <span className="mac-boot-progress">
              <span style={{ width: `${(loaded / EXTENSIONS.length) * 100}%` }} />
            </span>
          </div>
          <div className="mac-boot-extensions">
            {EXTENSIONS.slice(0, loaded).map((kind) => (
              <MacIcon key={kind} kind={kind} size={28} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** "It is now safe to turn off your computer", then back to the future. */
export function MacSafeToTurnOff({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2600)
    return () => window.clearTimeout(timer)
  }, [onDone])
  return (
    <div className="mac-safe" role="alertdialog" aria-label={text}>
      <div>
        <MacIcon kind="computer" size={32} />
        <p>{text}</p>
      </div>
    </div>
  )
}
