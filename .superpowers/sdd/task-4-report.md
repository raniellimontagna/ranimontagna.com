# Task 4 Report: Shader scene, scheduler, and resilient canvas

Status: **DONE**

## Result

- Added a single-plane, single-material Spectral Veil scene with stable uniforms and no Three.js
  allocations in `useFrame`.
- Added a fixed-bound, three-octave FBM membrane shader with mobile detail reduction, broad warped
  fields, a calm center, soft edges, theme colors, and subtle grain.
- Added an explicit `frameloop="never"` scheduler capped at 45 FPS on desktop and 30 FPS on mobile.
  Hidden mode owns no RAF, and the first resumed frame establishes a new time baseline.
- Added exact DPR policy (`[1, 1.5]` desktop, `1` mobile), low-power renderer settings, one bounded
  context restoration, permanent fallback after a later loss, and guarded renderer disposal.
- Removed Task 3's temporary expected-error suppression now that the literal lazy import resolves.
- Narrowed `Skill.icon` to the simple-icons `IconType`. R3F augments React's intrinsic element map;
  the previous broad `React.ElementType` consequently collapsed the icon's accepted props to
  `never` once R3F entered the TypeScript program.

## TDD evidence

### RED

1. `pnpm exec vitest run src/shared/components/spectral-background/__tests__/spectral-veil-runtime.test.tsx`
   failed because `../spectral-render-scheduler` did not exist.
2. A renderer-lifetime regression test failed because changing the failure callback disposed the
   live renderer. The callback is now held through a stable ref.
3. A renderer-error cleanup test failed because the error boundary reported failure without
   disposing the active renderer. Permanent failure now clears the renderer handle and triggers
   its guarded cleanup.
4. `pnpm typecheck` exposed the `React.ElementType` / R3F JSX augmentation collision in
   `skills-orbit.tsx`; the authorized narrow `IconType` integration fix resolves it.

### GREEN

- Task 4 runtime test: 10/10 passing.
- Combined Task 3 and Task 4 focused tests: 18/18 passing.
- `pnpm typecheck`: exit 0.
- Owned-file Biome check, including the authorized integration fix: exit 0.

## R3F lifecycle review

R3F 9.6's unmount path disposes render lists and calls `forceContextLoss`, but it does not call
`gl.dispose()`. The wrapper therefore owns one guarded `gl.dispose()` per renderer handle while R3F
continues to own declarative geometry/material disposal. Listener cleanup is tied to the same
renderer handle, and callback identity changes do not tear down a healthy renderer.

## Concerns

None for Task 4. GPU-independent runtime boundaries are covered here; the planned Task 6 visual
matrix remains the appropriate gate for live shader appearance across themes and viewports.

## Review fix follow-up — scheduler clock and restoration handoff

### RED evidence

`pnpm exec vitest run src/shared/components/spectral-background/__tests__/spectral-veil-runtime.test.tsx`
reported 3 failed and 9 passed tests:

- Logical-time regression expected `advance(0.023)` but received `advance(1023)`.
- Hide/show regression expected the first visible timestamp `0.023` but received `1023`, proving
  raw RAF milliseconds were reaching R3F.
- Delayed-restoration regression dispatched loss on the retired canvas and observed one unexpected
  `onPermanentFailure` call before replacement `onCreated`.

### Fix

- The scheduler now accumulates only cadence-qualified visible RAF deltas, converts milliseconds to
  seconds, preserves logical time across visibility changes, and resets RAF baselines on resume.
- Renderer cleanup now exposes one idempotent release function. Restoration invokes it synchronously
  before clearing the old handle and incrementing the Canvas generation, so delayed R3F teardown
  events cannot reach visitor-facing failure handling.
- The regression delays replacement `onCreated`, proves the old renderer is already disposed, proves
  a later old-canvas loss is ignored, then proves a real new-canvas loss fails permanently once.

### GREEN evidence

- Runtime suite: 12/12 passing.
- Combined Task 3 and Task 4 focused suites: 20/20 passing across 2 files.
- `pnpm typecheck`: exit 0 (`tsc --noEmit --incremental false`).
- Changed-file Biome: exit 0 (`Checked 3 files ... No fixes applied`).

### Follow-up concerns

None. Logical shader time now excludes hidden intervals, and the retired-renderer race is bounded by
synchronous listener detachment plus idempotent disposal.
