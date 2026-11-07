'use client'

import { type HTMLAttributes, useRef, useState } from 'react'

export function CodeBlock({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  return (
    <div className="group relative my-8">
      <pre
        {...props}
        ref={ref}
        className="overflow-x-auto rounded-[2px] border border-line bg-surface p-5 font-mono text-sm leading-relaxed text-foreground"
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(ref.current?.textContent ?? '')
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}
        className="absolute top-3 right-3 rounded-full border border-line bg-background px-3 py-1 font-mono text-[11px] text-muted opacity-100 transition-opacity hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
      >
        {copied ? '✓ copied' : 'copy'}
      </button>
    </div>
  )
}
