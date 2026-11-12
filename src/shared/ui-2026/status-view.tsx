'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'

type StatusAction = { label: string; href?: string; onClick?: () => void }

type StatusViewProps = {
  code: '404' | '500'
  title: string
  body: string
  actions: StatusAction[]
}

const GLYPHS = '{}[]()<>/=;:+*#$&|_?!'
const SCRAMBLE_MS = 700
const TICK_MS = 45

/** Error and not-found pages: a huge code that scrambles once, a title and real ways out. */
export function StatusView({ code, title, body, actions }: StatusViewProps) {
  const [shown, setShown] = useState<string>(code)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const started = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - started
      if (elapsed >= SCRAMBLE_MS) {
        setShown(code)
        clearInterval(timer)
        return
      }
      const settled = Math.floor((elapsed / SCRAMBLE_MS) * code.length)
      setShown(
        Array.from(code, (char, index) =>
          index < settled ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        ).join(''),
      )
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [code])

  const action =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5'

  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col justify-center gap-8 bg-background px-4 py-28 sm:px-8 lg:px-12"
    >
      <p
        aria-hidden="true"
        data-status-code
        className="font-mono text-[clamp(120px,28vw,420px)] leading-[0.8] font-semibold tracking-[-0.06em] text-accent"
      >
        {shown}
      </p>
      <h1 className="max-w-3xl text-[clamp(36px,5vw,80px)] leading-[0.95] font-semibold tracking-[-0.04em] text-foreground">
        {title}
      </h1>
      <p className="max-w-xl text-lg leading-snug text-foreground sm:text-xl">{body}</p>
      <span className="sr-only">{code}</span>
      <div className="flex flex-wrap gap-3">
        {actions.map((item, index) => {
          const classes = `${action} ${index === 0 ? 'bg-accent text-on-accent' : 'border border-line text-foreground hover:border-foreground'}`
          return item.href ? (
            <a key={item.label} href={item.href} className={classes}>
              {item.label}
            </a>
          ) : (
            <button key={item.label} type="button" onClick={item.onClick} className={classes}>
              {item.label}
            </button>
          )
        })}
      </div>
    </main>
  )
}
