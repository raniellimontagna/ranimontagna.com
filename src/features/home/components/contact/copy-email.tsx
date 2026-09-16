'use client'

import { CheckCircle, Copy } from '@solar-icons/react/ssr'
import { useEffect, useState } from 'react'

type CopyEmailProps = {
  email: string
  labels: { copy: string; copied: string; open: string }
}

/** E-mail em destaque: clique abre o cliente; o botão ao lado copia com feedback. */
export function CopyEmail({ email, labels }: CopyEmailProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`mailto:${email}`}
        aria-label={labels.open}
        className="group relative inline-block break-all font-heading text-[clamp(1.35rem,3.6vw,2.4rem)] font-semibold tracking-[-0.05em] text-foreground"
      >
        {email}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-1 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      </a>
      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-strong"
      >
        {copied ? (
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  )
}
