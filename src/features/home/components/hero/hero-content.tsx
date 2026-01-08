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
      className="absolute bottom-8 left-1/2 -translate-x-1/2 transform cursor-pointer animate-[fadeIn_0.8s_ease-out_1s_both] bg-transparent border-none"
      onClick={handleScroll}
      aria-label="Scroll to about section"
    >
      <div className="flex flex-col items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
        <span className="animate-pulse">SCROLL</span>
        <ArrowDown className="h-4 w-4 animate-bounce text-gray-500 dark:text-gray-400" />
      </div>
    </button>
  )
}
