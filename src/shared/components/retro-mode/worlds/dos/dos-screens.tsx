'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { useSkippableTimer } from '../world-hooks'
import { playTones } from '../world-sound'
import type { DosCopy } from './dos-copy'

/** The POST: one short beep, a memory count to 640K, the drives, then DOS. */
export function DosBoot({ copy, onDone }: { copy: DosCopy; onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  useSkippableTimer(true, 2900, onDone)

  useEffect(() => {
    const stop = playTones([{ f: 1000, at: 0.05, d: 0.14, type: 'square', v: 0.03 }])
    const started = performance.now()
    const timer = window.setInterval(() => setElapsed(performance.now() - started), 40)
    return () => {
      window.clearInterval(timer)
      stop()
    }
  }, [])

  const memory = Math.min(640, Math.floor((Math.max(0, elapsed - 250) / 1000) * 640) & ~31)
  return (
    <div className="dos-boot" aria-hidden="true">
      <pre className="dos-boot-logo">{'╔══════╗\n║  RM  ║\n║ 1998 ║\n╚══════╝'}</pre>
      <p>{copy.bios}</p>
      <p>&nbsp;</p>
      <p>
        {copy.memoryTest}: {String(memory).padStart(3, ' ')}K{memory >= 640 ? ' OK' : ''}
      </p>
      {elapsed > 1450 ? <p>{copy.drives}</p> : null}
      {elapsed > 2100 ? <p>{copy.starting}</p> : null}
      <p className="dos-boot-cursor">_</p>
      <p className="dos-boot-skip">{copy.skip}</p>
    </div>
  )
}

const GLYPHS = 'アイウエオカキクケコサシスセソ0123456789RANIMONTAGNA<>/{}=+*'

/** Green rain over the whole screen until a key, a click or ten seconds. */
export function DosMatrix({ onDone }: { onDone: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useSkippableTimer(true, 10_000, onDone)

  useEffect(() => {
    const element = canvas.current
    if (!element || prefersReducedMotion()) return
    let context: CanvasRenderingContext2D | null = null
    try {
      context = element.getContext('2d')
    } catch {
      context = null
    }
    if (!context) return
    const ctx = context
    const size = 16
    element.width = window.innerWidth
    element.height = window.innerHeight
    const columns = Math.ceil(element.width / size)
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -40))
    let frame = 0
    let last = 0
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)
      if (now - last < 50) return
      last = now
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
      ctx.fillRect(0, 0, element.width, element.height)
      ctx.font = `${size}px "Courier New", monospace`
      drops.forEach((y, x) => {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        ctx.fillStyle = Math.random() > 0.96 ? '#e8ffe0' : '#3dff6e'
        ctx.fillText(glyph, x * size, y * size)
        drops[x] = y * size > element.height && Math.random() > 0.97 ? 0 : y + 1
      })
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="dos-matrix" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  )
}

/**
 * Prints lines like a slow terminal, a few characters at a time. Screen readers
 * get the whole text at once; with reduced motion everyone does.
 */
export function TypedLines({ lines, animate }: { lines: string[]; animate: boolean }) {
  const total = lines.reduce((sum, line) => sum + line.length + 1, 0)
  const [shown, setShown] = useState(() => (animate && !prefersReducedMotion() ? 0 : total))
  const holder = useRef<HTMLDivElement>(null)

  const done = shown >= total

  useEffect(() => {
    if (done) return
    const timer = window.setInterval(() => {
      setShown((value) => Math.min(total, value + 5))
      const log = holder.current?.closest<HTMLElement>('.dos-output')
      if (log) log.scrollTop = log.scrollHeight
    }, 16)
    return () => window.clearInterval(timer)
  }, [done, total])

  if (done) {
    return lines.map((line, index) => <p key={index}>{line || ' '}</p>)
  }

  const starts = lines.map((_, index) =>
    lines.slice(0, index).reduce((sum, line) => sum + line.length + 1, 0),
  )
  return (
    <div ref={holder}>
      <div className="sr-only">
        {lines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div aria-hidden="true">
        {lines.map((line, index) => {
          const start = starts[index]
          if (shown < start) return null
          const typing = shown < start + line.length + 1
          return (
            <p key={index}>
              {line.slice(0, shown - start) || (typing ? '' : '\u00a0')}
              {typing ? <span className="dos-type-cursor">█</span> : null}
            </p>
          )
        })}
      </div>
    </div>
  )
}
