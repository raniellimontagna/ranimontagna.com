'use client'

import { ArrowDown } from '@solar-icons/react/ssr'

export function ScrollIndicator() {
  const handleScroll = () => {
    const section = document.getElementById('about')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button
      type="button"
      data-testid="scroll-down-indicator"
      className="surface-panel absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 cursor-pointer items-center gap-3 rounded-full px-4 py-2.5 animate-[fadeIn_0.8s_ease-out_1s_both] border-none sm:bottom-8"
      onClick={handleScroll}
      aria-label="Scroll to about section"
    >
      <span className="font-mono text-[0.68rem] font-semibold tracking-[0.22em] text-muted uppercase">
        Scroll
      </span>
      <ArrowDown className="h-4 w-4 animate-bounce text-foreground" />
    </button>
  )
}
