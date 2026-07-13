'use client'

import { SquareAltArrowUp } from '@solar-icons/react/ssr'
import { UserPreferenceControls } from '@/shared/components/user-preference-controls/user-preference-controls'
import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'

export function HomeHeaderControls() {
  const setCommandMenuOpen = useCommandMenu((state) => state.setOpen)

  return (
    <div data-testid="home-header-controls" className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => setCommandMenuOpen(true)}
        className="surface-panel flex h-10 w-10 items-center justify-center gap-2 rounded-2xl text-muted transition-all hover:bg-surface-strong hover:text-foreground sm:w-auto sm:px-3"
        aria-label="Open command palette"
        title="Open command palette"
      >
        <SquareAltArrowUp className="h-3.5 w-3.5" />
        <span className="hidden font-mono text-xs sm:inline">⌘K</span>
      </button>

      <UserPreferenceControls />
    </div>
  )
}
