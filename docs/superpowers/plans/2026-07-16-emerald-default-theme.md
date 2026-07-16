# Emerald Default Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Emerald palette the initial color theme for visitors without a valid saved preference while preserving valid stored choices.

**Architecture:** Keep the existing CSS palette and color-theme union unchanged. Update both runtime initialization paths—the Zustand store and the inline pre-hydration script—to share the same Emerald fallback behavior, then align the PWA manifest color with the selected dark Emerald accent.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, Vitest, jsdom, Web App Manifest

## Global Constraints

- Do not redesign the Emerald palette.
- Do not remove or rename any color theme.
- Do not overwrite valid preferences in local storage.
- Do not change the default light/dark mode.
- Reuse the committed Emerald CSS tokens without modifying `src/app/[locale]/globals.css`.

---

## File Map

- `src/shared/store/use-theme/use-theme.ts`: owns the client store's default color theme and persisted-value validation.
- `src/shared/store/use-theme/__tests__/use-theme.test.ts`: proves store fallback and preservation behavior.
- `src/app/[locale]/theme-init-script.ts`: applies the theme before React hydration and prevents a flash of the old palette.
- `src/app/[locale]/__tests__/head.test.ts`: executes the inline initialization script in jsdom.
- `public/manifest.json`: supplies the browser and installed-PWA theme color.
- `src/app/[locale]/__tests__/manifest.test.ts`: verifies the committed manifest color.

### Task 1: Default the client theme store to Emerald

**Files:**
- Modify: `src/shared/store/use-theme/use-theme.ts:8-31`
- Modify: `src/shared/store/use-theme/__tests__/use-theme.test.ts:3-124`

**Interfaces:**
- Consumes: persisted Zustand JSON shaped as `{ state: { theme?: Theme, colorTheme?: ColorTheme } }` under `theme-storage`.
- Produces: `useTheme.getState().colorTheme: ColorTheme`, with `emerald` used only when storage is missing, malformed, or contains an invalid color theme.

- [ ] **Step 1: Write failing store fallback and compatibility tests**

Update `beforeEach` so state cannot leak between tests, then add focused color-theme cases:

```ts
beforeEach(() => {
  useTheme.setState({ theme: 'dark', colorTheme: 'default', mounted: false })
  window.localStorage.clear()
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.removeAttribute('data-color-theme')
  document.documentElement.style.colorScheme = ''
})

describe('color theme initialization', () => {
  it.each([
    ['missing storage', null],
    ['invalid JSON', 'invalid-json'],
    ['missing color theme', JSON.stringify({ state: { theme: 'dark' } })],
    ['invalid color theme', JSON.stringify({ state: { colorTheme: 'unknown' } })],
  ])('defaults to emerald for %s', (_scenario, storedValue) => {
    if (storedValue !== null) {
      window.localStorage.setItem('theme-storage', storedValue)
    }

    useTheme.getState().initTheme()

    expect(useTheme.getState().colorTheme).toBe('emerald')
    expect(document.documentElement).toHaveAttribute('data-color-theme', 'emerald')
  })

  it.each(['default', 'ocean', 'rose', 'emerald', 'amber', 'violet', 'mono', 'sunset', 'cherry'] as const)(
    'preserves a saved %s color theme',
    (colorTheme) => {
      window.localStorage.setItem(
        'theme-storage',
        JSON.stringify({ state: { theme: 'dark', colorTheme } }),
      )

      useTheme.getState().initTheme()

      expect(useTheme.getState().colorTheme).toBe(colorTheme)
    },
  )
})
```

- [ ] **Step 2: Run the store tests and confirm the new expectations fail**

Run: `pnpm vitest run src/shared/store/use-theme/__tests__/use-theme.test.ts`

Expected: FAIL because missing or invalid storage currently resolves to `default`, and the DOM has no `data-color-theme` attribute.

- [ ] **Step 3: Change the store fallback constant**

In `src/shared/store/use-theme/use-theme.ts`, change only the color fallback:

```ts
const DEFAULT_THEME: Theme = 'dark'
const DEFAULT_COLOR_THEME: ColorTheme = 'emerald'
```

Keep `isValidColorTheme`, `applyColorTheme`, and all persisted valid values unchanged.

- [ ] **Step 4: Run the store tests**

Run: `pnpm vitest run src/shared/store/use-theme/__tests__/use-theme.test.ts`

Expected: PASS with all existing light/dark tests and the new color-theme cases passing.

- [ ] **Step 5: Commit the store behavior**

```bash
git add src/shared/store/use-theme/use-theme.ts src/shared/store/use-theme/__tests__/use-theme.test.ts
git commit -m "feat(theme): default new visitors to emerald"
```

### Task 2: Apply Emerald before hydration

**Files:**
- Modify: `src/app/[locale]/theme-init-script.ts:1-32`
- Modify: `src/app/[locale]/__tests__/head.test.ts:1-26`

**Interfaces:**
- Consumes: the same `theme-storage` JSON as Task 1.
- Produces: an inline script that sets `data-color-theme="emerald"` before hydration for absent, malformed, or invalid color preferences and preserves all valid saved themes, including `default` as no attribute.

- [ ] **Step 1: Write failing pre-hydration fallback tests**

Extend `src/app/[locale]/__tests__/head.test.ts`:

```ts
it.each([
  ['missing storage', null],
  ['invalid JSON', 'invalid-json'],
  ['missing color theme', JSON.stringify({ state: { theme: 'dark' } })],
  ['invalid color theme', JSON.stringify({ state: { colorTheme: 'unknown' } })],
])('applies emerald before hydration for %s', (_scenario, storedValue) => {
  if (storedValue !== null) {
    window.localStorage.setItem('theme-storage', storedValue)
  }

  runThemeInitScript()

  expect(document.documentElement).toHaveClass('dark')
  expect(document.documentElement.style.colorScheme).toBe('dark')
  expect(document.documentElement).toHaveAttribute('data-color-theme', 'emerald')
})

it('keeps the base palette when default is explicitly saved', () => {
  window.localStorage.setItem(
    'theme-storage',
    JSON.stringify({ state: { theme: 'dark', colorTheme: 'default' } }),
  )

  runThemeInitScript()

  expect(document.documentElement).not.toHaveAttribute('data-color-theme')
})
```

Keep the existing `rose` preservation test.

- [ ] **Step 2: Run the initialization-script tests and confirm failure**

Run: `pnpm vitest run 'src/app/[locale]/__tests__/head.test.ts'`

Expected: FAIL because absent or invalid preferences currently remove the color-theme attribute.

- [ ] **Step 3: Implement one explicit color fallback in the inline script**

Update `src/app/[locale]/theme-init-script.ts` so `default` remains a valid explicit choice while all invalid states resolve to Emerald:

```ts
export const THEME_INIT_SCRIPT = `
(() => {
  const storageKey = 'theme-storage';
  const fallbackTheme = 'dark';
  const fallbackColorTheme = 'emerald';
  const validColorThemes = ['default', 'ocean', 'rose', 'emerald', 'amber', 'violet', 'mono', 'sunset', 'cherry'];
  const root = document.documentElement;

  const applyColorTheme = (colorTheme) => {
    if (colorTheme === 'default') {
      root.removeAttribute('data-color-theme');
    } else {
      root.setAttribute('data-color-theme', colorTheme);
    }
  };

  try {
    const savedTheme = localStorage.getItem(storageKey);
    const parsed = savedTheme ? JSON.parse(savedTheme) : null;
    const theme = parsed?.state?.theme === 'light' || parsed?.state?.theme === 'dark'
      ? parsed.state.theme
      : fallbackTheme;
    const savedColorTheme = parsed?.state?.colorTheme;
    const colorTheme = validColorThemes.includes(savedColorTheme)
      ? savedColorTheme
      : fallbackColorTheme;

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
    applyColorTheme(colorTheme);
  } catch {
    root.classList.remove('light', 'dark');
    root.classList.add(fallbackTheme);
    root.style.colorScheme = fallbackTheme;
    applyColorTheme(fallbackColorTheme);
  }
})();
`
```

- [ ] **Step 4: Run the initialization-script tests**

Run: `pnpm vitest run 'src/app/[locale]/__tests__/head.test.ts'`

Expected: PASS for missing, malformed, invalid, explicit `default`, and saved `rose` cases.

- [ ] **Step 5: Commit the pre-hydration behavior**

```bash
git add 'src/app/[locale]/theme-init-script.ts' 'src/app/[locale]/__tests__/head.test.ts'
git commit -m "fix(theme): hydrate with emerald fallback"
```

### Task 3: Align the PWA theme color and run final verification

**Files:**
- Modify: `public/manifest.json:8`
- Create: `src/app/[locale]/__tests__/manifest.test.ts`

**Interfaces:**
- Consumes: `public/manifest.json` and the existing dark Emerald accent `#34d399` from `src/app/[locale]/globals.css`.
- Produces: browser/PWA chrome that uses `#34d399` and a regression test guarding that contract.

- [ ] **Step 1: Write the failing manifest regression test**

Create `src/app/[locale]/__tests__/manifest.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('web app manifest', () => {
  it('uses the Emerald default theme color', () => {
    const manifestPath = resolve(process.cwd(), 'public/manifest.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { theme_color?: string }

    expect(manifest.theme_color).toBe('#34d399')
  })
})
```

- [ ] **Step 2: Run the manifest test and confirm failure**

Run: `pnpm vitest run 'src/app/[locale]/__tests__/manifest.test.ts'`

Expected: FAIL with expected `#34d399` and received `#3b82f6`.

- [ ] **Step 3: Update the manifest color**

Change `public/manifest.json`:

```json
"theme_color": "#34d399"
```

- [ ] **Step 4: Run focused and repository checks**

Run:

```bash
pnpm vitest run src/shared/store/use-theme/__tests__/use-theme.test.ts 'src/app/[locale]/__tests__/head.test.ts' 'src/app/[locale]/__tests__/manifest.test.ts'
pnpm check
pnpm typecheck
pnpm test
git diff --check
```

Expected: every command exits with status 0; Vitest reports all tests passing; Biome and TypeScript report no errors; `git diff --check` prints no output.

- [ ] **Step 5: Commit the manifest and regression test**

```bash
git add public/manifest.json 'src/app/[locale]/__tests__/manifest.test.ts'
git commit -m "chore(theme): align manifest with emerald"
```

