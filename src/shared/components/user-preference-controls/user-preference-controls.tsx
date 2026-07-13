'use client'

import { ColorThemePicker } from '@/shared/components/color-theme-picker/color-theme-picker'
import { LanguageSwitcher } from '@/shared/components/language-switcher/language-switcher'
import { ThemeProvider } from '@/shared/components/theme-provider/theme-provider'
import { ThemeToggle } from '@/shared/components/theme-toggle/theme-toggle'

export function UserPreferenceControls(): React.ReactElement {
  return (
    <ThemeProvider>
      <div className="flex shrink-0 items-center gap-2">
        <div
          data-testid="language-preference-controls"
          className="surface-panel flex h-10 w-fit shrink-0 items-center rounded-2xl p-1"
        >
          <LanguageSwitcher />
        </div>
        <div
          data-testid="appearance-preference-controls"
          className="surface-panel flex h-10 shrink-0 items-center gap-1 rounded-2xl p-1"
        >
          <ColorThemePicker />
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  )
}
