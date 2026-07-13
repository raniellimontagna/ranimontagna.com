# Compact Header Preferences Design

## Context

The blog header visually presents the language selector as an oversized control. The selector itself already has intrinsic width. The apparent empty width comes from the shared surface that also reserves two 32 px placeholders for the color-theme picker and light/dark toggle.

Those placeholders never hydrate on blog routes because the global `ThemeProvider` was removed during the home performance work and reintroduced only around `HomeHeaderControls`.

## Approved Direction

Separate language and appearance into two clearly distinct surfaces:

- Language remains a compact, intrinsic-width control.
- Color palette and light/dark mode remain adjacent in their own appearance group.
- A shared preference-control component keeps the home and shared header visually consistent.
- The shared component owns `ThemeProvider`, so appearance controls initialize on every route where they are rendered.

## Layout

The outer row uses the existing 8 px spacing token (`gap-2`). Each surface keeps the existing 40 px height, 16 px radius, and 4 px internal padding.

- Language surface: `w-fit shrink-0`, containing only `LanguageSwitcher`.
- Appearance surface: `shrink-0`, containing `ColorThemePicker` and `ThemeToggle` with the existing 4 px gap.

The controls keep their existing accessible names, keyboard behavior, dropdown behavior, and 32 px visual dimensions. Existing focus rings and expanded hit areas remain unchanged.

## Component Boundary

Create `UserPreferenceControls` under shared components. It composes:

- `ThemeProvider`
- `LanguageSwitcher`
- `ColorThemePicker`
- `ThemeToggle`

`Header` and `HomeHeaderControls` consume this component instead of duplicating the control composition.

## Verification

- Component test proves language and appearance are separate groups.
- Component test proves the group is wrapped by `ThemeProvider`.
- Existing header and home-header-control tests continue to pass.
- Type checking and Biome checks pass.
- Production build succeeds.

