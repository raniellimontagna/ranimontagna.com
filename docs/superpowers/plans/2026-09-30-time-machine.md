# Time machine implementation plan

**Goal:** Build all approved portfolio universes, starting XP, then DOS and Game Boy.

**Architecture:** Keep the current server-rendered portfolio and boolean active
compatibility. Add a typed mode and opt-in chrome/styles. Each world's isolated
component owns its controls; the shared controller owns persistence, lazy
dispatch and focus restoration. Each universe has its own secret icon.

**Tech Stack:** Existing React, Next.js, Zustand, NextIntl and CSS. No dependencies.

## Global constraints

- Modes: 1998, xp, dos, gameboy, newspaper, ide, mac; modern is null.
- Same content and real locale-aware links; no duplicated project/bio catalog.
- Keep active boolean for existing GSAP/canvas cleanup.
- Session persistence, legacy true migration, independent theme storage.
- pt/en/es chrome, keyboard controls, 44px targets, responsive at 320px.
- Do not change unrelated files. Publication was authorized after preview review.

## Task 1: Shared controller and secret triggers

- [x] Extend store with `mode`, `setMode`; setActive
  remains compatible. Session 'true' maps 1998, valid strings map to modes,
  invalid data maps null. Apply data-retro=true and data-retro-mode together.
- [x] Update inline init for typed modes before hydration.
- [x] Add regression cases for migration, invalid modes, storage fallback,
  modern theme preservation and focus restoration, including cached re-entry.
- [x] Add individual `RetroSecret({mode})` icons at the six specified locations,
  and `WorldControls({locale,onExit})` for an accessible common exit.
- [x] Lazily dispatch the selected world's independent chrome module.

## Task 2: Windows XP

- [x] Build XpWorld and xp.css: desktop shortcuts, original landscape asset,
  Start menu, Explorer chrome, same main content framed as document window.
- [x] Add tests for menu keyboard/close behavior, actual navigation targets,
  focus leaving the menu and Escape in external text fields.
- [x] Inspect served desktop first, then mobile.

## Task 3: DOS

- [x] Build DosWorld, pure command parser and dos.css. Accept localized aliases;
  commands map only to allowlisted destinations. Keep input/history accessible.
- [x] Add tests for help, clear, unknown commands, routes, history, section
  focus, exit behavior and keyboard isolation from external forms.
- [x] Inspect served terminal and all document sections.

## Task 4: Game Boy

- [x] Build GameBoyWorld and gameboy.css with actual D-pad/A/B interactions and
  four-tone palette. Keyboard event handlers belong to focused console only.
- [x] Add tests for wrap selection, navigation, reset, A/B shortcuts and native
  Enter on controls, without interfering with external forms.
- [x] Inspect served console/skills/footer at 320px.

## Task 5: Remaining universes

- [x] Build NewspaperWorld, IdeWorld and MacWorld, each with isolated CSS and
  real navigation. Newspaper masthead and articles; IDE file explorer/tabs;
  Mac desktop/menu/folders. Include the common exit control and preserve each
  universe's individual secret icon.

## Task 6: Integration and verification

- [x] Render only the selected chrome, preserve the 1998 chrome and shared focus
  behavior. Import styles after existing retro stylesheet from root layout.
- [x] Build and scoped Biome passed after the reviewed fixes, as reported by
  the integrator.
- [x] Record focused tests, TypeScript and full tests/coverage results after the
  GSAP fix and before the last chat marker/CSS adjustment.
- [x] Browser checks every world and mode switches, reload/navigation, mobile,
  long labels, skill geometry, logos, input contrast and return to modern.
- [x] Independent static code review completed; identified defects fixed and
  reviewed again.
- [x] Validate GSAP exit-focus regression, remaining world inspections and
  follow-up CSS review fixes.
- [x] Finish the fresh production build and focused tests after the last chat
  marker/CSS change, then inspect launcher/panel above the fixed bars.

Implementation and test-case checkboxes describe evidence in the code, not a
claim that every check ran after the last change. The full suite of 1,305 tests
preceded the final chat marker/CSS adjustment; its fresh build, TypeScript,
134 focused tests, scoped Biome and served browser check passed. This local
delivery is complete without push or publication. See the
[validation record](../specs/2026-09-30-time-machine-validation.md).
