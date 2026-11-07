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
        className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
      >
        {label} · <span className="font-mono">{email}</span>
      </button>
      <span role="status" aria-live="polite" className="font-mono text-xs text-accent">
        {done ? copied : ''}
      </span>
    </span>
  )
}
