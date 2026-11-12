'use client'

import { useEffect, useState } from 'react'

type CopyEmailButtonProps = { email: string; label: string; copied: string }

export function CopyEmailButton({ email, label, copied }: CopyEmailButtonProps) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => setDone(false), 2400)
    return () => clearTimeout(timer)
  }, [done])

  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(email)
          setDone(true)
        }}
        className="inline-flex flex-col items-start gap-0.5 rounded-2xl border border-line px-6 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:border-foreground sm:flex-row sm:items-center sm:gap-2 sm:rounded-full"
      >
        <span>{label}</span>
        <span className="font-mono text-xs text-muted sm:text-sm sm:text-foreground">{email}</span>
      </button>
      <span role="status" aria-live="polite" className="font-mono text-xs text-accent">
        {done ? copied : ''}
      </span>
    </span>
  )
}
