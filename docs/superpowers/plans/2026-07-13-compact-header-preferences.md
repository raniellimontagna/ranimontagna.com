# Compact Header Preferences Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the language selector visibly compact while restoring functional appearance controls on blog routes.

**Architecture:** Introduce a shared `UserPreferenceControls` composition that owns theme initialization and renders language and appearance in separate intrinsic-width surfaces. Replace duplicated compositions in the shared header and home header controls with this component.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, Vitest, React Testing Library

## Global Constraints

- Preserve the existing `LanguageSwitcher`, `ColorThemePicker`, and `ThemeToggle` behavior.
- Use the existing 40 px surface height, 16 px radius, and Tailwind spacing scale.
- Keep language and appearance in separate visual surfaces.
- Do not modify unrelated untracked planning documents.

---

### Task 1: Shared user preference controls

**Files:**
- Create: `src/shared/components/user-preference-controls/user-preference-controls.tsx`
- Create: `src/shared/components/user-preference-controls/__tests__/user-preference-controls.test.tsx`
- Modify: `src/shared/components/layout/header/header.tsx`
- Modify: `src/features/home/components/home-header-controls.tsx`
- Test: `src/shared/components/user-preference-controls/__tests__/user-preference-controls.test.tsx`
- Test: `src/shared/components/layout/header/__tests__/header.test.tsx`
- Test: `src/features/home/components/__tests__/home-header-controls.test.tsx`

**Interfaces:**
- Consumes: `ThemeProvider`, `LanguageSwitcher`, `ColorThemePicker`, and `ThemeToggle`.
- Produces: `UserPreferenceControls(): React.ReactElement`.

- [ ] **Step 1: Write the failing component test**

```tsx
it('separates language from appearance controls inside the theme provider', () => {
  render(<UserPreferenceControls />)

  const provider = screen.getByTestId('theme-provider')
  const language = screen.getByTestId('language-preference-controls')
  const appearance = screen.getByTestId('appearance-preference-controls')

  expect(provider).toContainElement(language)
  expect(provider).toContainElement(appearance)
  expect(language).toHaveClass('w-fit', 'shrink-0')
  expect(language).toContainElement(screen.getByRole('button', { name: 'Change language' }))
  expect(appearance).toContainElement(screen.getByRole('button', { name: 'Change color theme' }))
  expect(appearance).toContainElement(screen.getByRole('button', { name: 'Toggle theme' }))
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/shared/components/user-preference-controls/__tests__/user-preference-controls.test.tsx`

Expected: FAIL because `UserPreferenceControls` does not exist.

- [ ] **Step 3: Implement the minimal shared component**

```tsx
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
```

- [ ] **Step 4: Run the component test to verify it passes**

Run: `pnpm test src/shared/components/user-preference-controls/__tests__/user-preference-controls.test.tsx`

Expected: PASS.

- [ ] **Step 5: Replace duplicated compositions**

In `Header`, replace both duplicated language/theme surface blocks with `<UserPreferenceControls />`. In `HomeHeaderControls`, keep the command-menu button and replace its existing theme-provider/control block with `<UserPreferenceControls />`.

- [ ] **Step 6: Run focused regression tests**

Run: `pnpm test src/shared/components/user-preference-controls/__tests__/user-preference-controls.test.tsx src/shared/components/layout/header/__tests__/header.test.tsx src/features/home/components/__tests__/home-header-controls.test.tsx`

Expected: all tests PASS without warnings.

- [ ] **Step 7: Run repository verification**

Run: `pnpm typecheck && pnpm check && pnpm build`

Expected: all commands exit with status 0.

- [ ] **Step 8: Commit the implementation**

```bash
git add \
  src/shared/components/user-preference-controls/user-preference-controls.tsx \
  src/shared/components/user-preference-controls/__tests__/user-preference-controls.test.tsx \
  src/shared/components/layout/header/header.tsx \
  src/features/home/components/home-header-controls.tsx
git commit -m "fix(header): compact language and restore theme controls"
```

