'use client'

import { Download, SquareAltArrowUp } from '@solar-icons/react/ssr'
import { useEffect, useRef, useState } from 'react'
import { UserPreferenceControls } from '@/shared/components/user-preference-controls/user-preference-controls'
import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'

type HomeHeaderControlsProps = {
  resumeLink: { href: string; filename: string; name: string }
  labels: { command: string; more: string }
}

export function HomeHeaderControls({ resumeLink, labels }: HomeHeaderControlsProps) {
  const setCommandMenuOpen = useCommandMenu((state) => state.setOpen)
  const [isOpen, setIsOpen] = useState(false)
  const disclosureRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      disclosureRef.current?.focus()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  return (
    <div data-testid="home-header-controls" className="relative flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => setCommandMenuOpen(true)}
        className="surface-panel flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-2xl text-muted transition-all hover:bg-surface-strong hover:text-foreground sm:w-auto sm:px-3"
        aria-label={labels.command}
        title={labels.command}
      >
        <SquareAltArrowUp className="h-3.5 w-3.5" />
        <span className="hidden font-mono text-xs sm:inline">⌘K</span>
      </button>

      <div data-testid="compact-home-appearance" className="shrink-0 sm:hidden">
        <UserPreferenceControls variant="appearance" />
      </div>

      <button
        ref={disclosureRef}
        type="button"
        aria-label={labels.more}
        aria-expanded={isOpen}
        aria-controls="home-header-secondary-controls"
        onClick={() => setIsOpen((open) => !open)}
        className="surface-panel flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-foreground transition-colors hover:bg-surface-strong sm:hidden"
      >
        <span aria-hidden="true" className="mb-1 text-lg leading-none tracking-[0.12em]">
          ···
        </span>
      </button>

      <div
        data-testid="desktop-home-preferences"
        className="hidden shrink-0 items-center gap-2 sm:flex"
      >
        <UserPreferenceControls />
        <a
          href={resumeLink.href}
          download={resumeLink.filename}
          aria-label={resumeLink.name}
          title={resumeLink.name}
          className="surface-panel flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-foreground transition-colors hover:bg-surface-strong"
        >
          <Download className="h-4 w-4" />
        </a>
      </div>

      {isOpen ? (
        <div
          id="home-header-secondary-controls"
          data-testid="compact-home-preferences"
          className="surface-panel-strong absolute top-[calc(100%+0.75rem)] right-0 z-60 flex w-64 flex-col gap-3 rounded-3xl border border-line p-3 shadow-panel sm:hidden"
        >
          <UserPreferenceControls variant="language" />
          <a
            href={resumeLink.href}
            download={resumeLink.filename}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            <Download className="h-4 w-4" />
            {resumeLink.name}
          </a>
        </div>
      ) : null}
    </div>
  )
}
