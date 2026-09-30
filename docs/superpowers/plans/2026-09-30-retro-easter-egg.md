# Retro Easter Egg Implementation Plan

**Goal:** Restore a playful 1998 version of the existing portfolio on demand.
**Architecture:** A small Zustand store controls a data-retro attribute and
sessionStorage. Global scoped styles restyle the existing server-rendered
content; client controls provide the hidden trigger and return action.
**Tech Stack:** Next.js 16.3, React 19, Zustand, CSS, next-intl, Vitest.

## Global constraints

Use the installed Next.js guides. Preserve unrelated local changes. No new
runtime dependencies. All three locales, mobile, keyboard and reduced motion
must work. Preserve theme preferences. No fake visitor counts. No deployment.

## Tasks

- [x] Add interaction tests in src/shared/components/retro-mode/__tests__ for
  activation, session restoration, blocked storage and exit focus. Run
  `pnpm exec vitest run src/shared/components/retro-mode/__tests__` and confirm
  the missing implementation fails.
- [x] Add src/shared/store/use-retro-mode/use-retro-mode.ts, translated copy
  and client controls under src/shared/components/retro-mode. Integrate the
  trigger in Footer and shared chrome in LocaleLayout. Extend THEME_INIT_SCRIPT
  with independent guarded session restoration before hydration.
- [x] Add retro-mode.css with scoped classic typography, tiled navy background,
  embossed surfaces, blue links, responsive masthead and fixed return toolbar.
  Supply local pixel construction assets, with a static reduced-motion version.
- [x] Pause spectral canvas and experience pinning when retro is active; use
  their existing cleanup lifecycle. Render all experience entries in flow.
- [x] Run focused Vitest suites, typecheck, Biome and production build. Run React
  Doctor on changed files. Inspect home, project/blog navigation, reload,
  returning to modern, mobile overflow and reduced motion in a real browser.
