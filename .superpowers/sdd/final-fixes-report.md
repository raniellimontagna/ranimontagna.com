# Final Spectral Veil fix wave report

## Status

**DONE_WITH_CONCERNS**

All seven final-review findings were addressed in one scoped fix wave. Automated tests, Biome, TypeScript, and the production build pass. No visual browser acceptance is claimed. React Doctor still reports preexisting/false-positive diagnostics in touched files, and the successful build emitted recoverable external GitHub API rate-limit warnings.

## Scope isolation

- Starting HEAD: `13afc76` (`fix(background): observe deferred spectral zones`).
- Changed only Spectral Background source/tests, standalone `ErrorLayout` source/test, and this report.
- Existing dirty chatbot files, `PRODUCT.md`, and unrelated Lemon plans/specs were not edited, formatted, reverted, or staged.
- Root `global-error.tsx` and `not-found.tsx` already use the standalone `ErrorLayout`; no route-source edit was needed.

## Findings resolved

1. `SpectralVeilCanvas` now has an absolute, inset, full-size intermediate wrapper so R3F's percentage-sized root fills the fixed shell.
2. The R3F Canvas receives full width/height plus `pointerEvents: 'none'`, and uses a disabled event manager. External desktop `window.pointermove` tracking remains covered and active.
3. The section observer uses thresholds from `0` through `1` in `0.1` increments while retaining ratio-first and center-distance tie-breaking, deferred marker reconciliation, and cleanup.
4. Standalone `ErrorLayout` mounts exactly one `SpectralBackground` before `ErrorContent`; locale layout coverage still asserts its own single mount.
5. Capability detection is WebGL2-only. Three r185's real `gl.debug.onShaderError` hook is assigned during `onCreated`, restored on release, and routes compile/link failure to an idempotent permanent-failure path. Cleanup is available synchronously for a failure raised immediately after renderer creation. R3F exposes Canvas fallback content but no renderer-creation error callback, so no unsupported prop was invented.
6. The lazy canvas import stores and reuses one pending promise so effect cleanup/reattach cannot discard the only resolution or trigger a duplicate import.
7. WebGL2 capability is cached per `SpectralBackground` mount, including across resize/media updates.

## TDD RED evidence

Initial focused command:

```text
pnpm exec vitest run src/shared/components/spectral-background/__tests__/spectral-background.test.tsx src/shared/components/spectral-background/__tests__/spectral-veil-runtime.test.tsx src/shared/components/spectral-background/__tests__/use-spectral-environment.test.tsx src/shared/components/spectral-background/__tests__/spectral-background.utils.test.ts src/shared/components/ui/__tests__/error-view.test.tsx
```

Exit `1`: **6 expected failures, 39 passes**. The failures demonstrated WebGL1 incorrectly accepted, missing ErrorLayout background, absent threshold options, unsized/pointer-active Canvas props, absent shader hook, and repeated capability probes.

The loader replay regression was then tightened and run separately. Exit `1`: the restarted pending effect invoked a second loader instead of preserving one pending resolution. After wiring the Three hook, an additional immediate-creation cleanup regression was run separately. Exit `1`: permanent failure was reported but `gl.dispose()` had not run because the cleanup was not yet registered.

## TDD GREEN evidence

Final focused behavior set: **5/5 files, 46/46 tests passed**. This includes:

- full-size shell and non-interactive R3F Canvas props;
- observer threshold ladder and existing most-visible/center tie-break behavior;
- exactly one standalone background before error content;
- WebGL1-only rejection;
- shader-hook idempotence, restoration, active renderer disposal, and immediate post-creation failure cleanup;
- StrictMode plus real reduced-motion off/on effect cleanup/reattach while the loader is pending, asserting one loader call and eventual canvas render;
- one capability probe across repeated resize events;
- existing external desktop pointer normalization and listener cleanup.

## Fresh gates

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm test` | `0` | 103/103 files, 1,023/1,023 tests passed. |
| `pnpm check` | `0` | Biome checked 283 files; no fixes applied. |
| `pnpm typecheck` | `0` | `tsc --noEmit --incremental false` completed without diagnostics after explicitly typing the renderer debug fake. |
| `pnpm build` | `0` | Next.js 16.2.10 compiled, TypeScript completed, and 17/17 static pages generated. |
| `npx react-doctor@latest --verbose --scope changed` | `1` | React Doctor 0.8.0: 70/100, 4 errors and 1 warning; triage below. |
| `rg -n atmospheric-grid src` | `1` | Empty output, the expected no-source-match result. |

## Concerns and diagnostic triage

- React Doctor reports `useSpectralEnvironment`'s IntersectionObserver effect as lacking cleanup, but the same effect disconnects the mutation and intersection observers and clears both collections in its returned cleanup. This is a false positive caused by the early no-allocation return when `IntersectionObserver` is unavailable.
- It reports browser globals in `useSpectralEnvironment`'s state initializers. This hook is inside the dynamically imported Canvas module, which is loaded only from the parent client effect after capability/motion selection. The report is preexisting and was not expanded into an unrelated lifecycle refactor.
- It reports the preexisting current-callback ref assignment during render and the preexisting full Framer Motion import in `ErrorLayout`. Neither was introduced by this wave; changing them would broaden the final-review fix scope.
- `pnpm build` emitted recoverable GitHub content-source `403` rate-limit and `429` abuse-detection warnings. The command still exited `0`, completed the route table, and generated all 17 static pages.
- No visual browser/WebGL acceptance or screenshot matrix was performed or claimed.

## Commit scope

The commit contains exactly the ten changed Spectral/ErrorLayout source and test files plus this forced-added ignored report. Unrelated dirty chatbot and user documentation files remain unstaged.
