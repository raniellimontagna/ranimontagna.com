'use client'

import { openVega } from '@/shared/lib/vega-events'
import { VegaMark } from '@/shared/vega/vega-mark'

/** Vega's star dust, on every page. Focus comes back here when Vega closes. */
export function VegaLauncher({ label }: { label: string }) {
  return (
    <button
      type="button"
      data-chat-launcher
      aria-label={label}
      title={label}
      onClick={openVega}
      className="fixed right-[max(1.25rem,var(--safe-right))] bottom-[max(1.25rem,var(--safe-bottom))] z-40 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-background transition-transform duration-300 hover:scale-105 active:scale-95"
    >
      <VegaMark size={46} density={60} />
    </button>
  )
}
