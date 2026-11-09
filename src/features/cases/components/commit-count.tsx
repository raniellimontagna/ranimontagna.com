'use client'

import { useEffect, useMemo, useRef } from 'react'
import { loadScrollMotion, prefersReducedMotion } from '@/shared/components/motion'
import { buildCountUp } from './case-motion'

/**
 * "428/429" set large: the agent-assisted commits count up the first time the
 * number enters. Assistive tech reads one sentence instead of the ticking.
 */
export function CommitCount({
  agent,
  total,
  locale,
  label,
}: {
  agent: number
  total: number
  locale: string
  label: string
}) {
  const numberRef = useRef<HTMLSpanElement>(null)
  const format = useMemo(() => {
    const formatter = new Intl.NumberFormat(locale)
    return (value: number) => formatter.format(value)
  }, [locale])

  useEffect(() => {
    const element = numberRef.current
    if (!element || prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | undefined
    loadScrollMotion().then((motion) => {
      if (!cancelled) revert = buildCountUp(motion, element, agent, format)
    })
    return () => {
      cancelled = true
      revert?.()
    }
  }, [agent, format])

  return (
    <div className="flex flex-col gap-3">
      <p className="sr-only">{`${format(agent)} / ${format(total)} ${label}`}</p>
      <p
        aria-hidden="true"
        className="text-[clamp(64px,10vw,160px)] leading-[0.85] font-semibold tracking-[-0.05em] text-foreground tabular-nums"
      >
        <span data-commit-count ref={numberRef}>
          {format(agent)}
        </span>
        <span className="text-muted">/{format(total)}</span>
      </p>
      <p aria-hidden="true" className="font-mono text-sm text-accent">
        {label}
      </p>
    </div>
  )
}
