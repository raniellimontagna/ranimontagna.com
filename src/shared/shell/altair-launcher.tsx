'use client'

import { openAltair } from '@/shared/lib/altair-events'

/** The Altair star, on every page. Focus comes back here when the chat closes. */
export function AltairLauncher({ label }: { label: string }) {
  return (
    <button
      type="button"
      data-chat-launcher
      aria-label={label}
      title={label}
      onClick={openAltair}
      className="group fixed right-[max(1.25rem,var(--safe-right))] bottom-[max(1.25rem,var(--safe-bottom))] z-40 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-background text-accent transition-transform duration-300 hover:scale-105 active:scale-95"
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="h-7 w-7 transition-transform duration-500 group-hover:rotate-45 motion-safe:animate-[spin_24s_linear_infinite]"
      >
        <path d="M32 2 L38 26 L62 32 L38 38 L32 62 L26 38 L2 32 L26 26 Z" fill="currentColor" />
      </svg>
    </button>
  )
}
