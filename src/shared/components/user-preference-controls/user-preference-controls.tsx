'use client'

import { ColorThemePicker } from '@/shared/components/color-theme-picker/color-theme-picker'
import { LanguageSwitcher } from '@/shared/components/language-switcher/language-switcher'
import { ThemeProvider } from '@/shared/components/theme-provider/theme-provider'
import { ThemeToggle } from '@/shared/components/theme-toggle/theme-toggle'

type UserPreferenceControlsProps = {
  variant?: 'all' | 'appearance' | 'language'
}

export function UserPreferenceControls({
  variant = 'all',
}: UserPreferenceControlsProps = {}): React.ReactElement {
  const showLanguage = variant !== 'appearance'
  const showAppearance = variant !== 'language'

  return (
    <ThemeProvider>
      <div className="flex shrink-0 items-center gap-2">
        {showLanguage ? (
          <div
            data-testid="language-preference-controls"
            className="surface-panel flex h-10 w-fit shrink-0 items-center rounded-2xl p-1"
          >
            <LanguageSwitcher />
          </div>
        ) : null}
        {showAppearance ? (
          <div
            data-testid="appearance-preference-controls"
            className="surface-panel flex h-10 shrink-0 items-center gap-1 rounded-2xl p-1"
          >
            <ColorThemePicker />
            <ThemeToggle />
          </div>
        ) : null}
      </div>
    </ThemeProvider>
  )
}
