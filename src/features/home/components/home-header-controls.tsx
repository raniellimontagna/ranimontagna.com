'use client'

import { SquareAltArrowUp } from '@solar-icons/react/ssr'
import { ColorThemePicker } from '@/shared/components/color-theme-picker/color-theme-picker'
import { LanguageSwitcher } from '@/shared/components/language-switcher/language-switcher'
import { ThemeProvider } from '@/shared/components/theme-provider/theme-provider'
import { ThemeToggle } from '@/shared/components/theme-toggle/theme-toggle'
import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'

export function HomeHeaderControls() {
  const setCommandMenuOpen = useCommandMenu((state) => state.setOpen)

  return (
    <ThemeProvider>
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

        <div className="surface-panel flex h-10 items-center gap-1 rounded-2xl p-1">
          <LanguageSwitcher />
          <ColorThemePicker />
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  )
}
