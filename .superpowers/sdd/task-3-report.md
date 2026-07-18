# Task 3: SSR fallback and progressive-enhancement orchestrator

## RED

`pnpm exec vitest run src/shared/components/spectral-background/__tests__/spectral-background.test.tsx`
initially failed as expected because `../spectral-background` did not exist:

```
Error: Failed to resolve import "../spectral-background"
Test Files  1 failed (1)
```

## GREEN

Implemented the always-present CSS fallback, SSR-static client orchestrator, media/resize capability selection, one-shot injectable canvas loading, and permanent-failure fallback behavior.

```
pnpm exec vitest run src/shared/components/spectral-background/__tests__/spectral-background.test.tsx
Test Files  1 passed (1)
Tests  8 passed (8)
```

## Note

The focused behavior suite passed before restoring the requested literal default import. Task 4's `spectral-veil-canvas` module does not exist yet, and Vite resolves that literal eagerly even though every test injects `canvasLoader`:

```
pnpm exec vitest run src/shared/components/spectral-background/__tests__/spectral-background.test.tsx
Error: Failed to resolve import "./spectral-veil-canvas" from "src/shared/components/spectral-background/spectral-background.tsx"
Test Files  1 failed (1)
Tests  no tests
```

The source now keeps the required literal `import('./spectral-veil-canvas')` with a narrowly scoped `@ts-expect-error`; Task 4 must remove that suppression when it creates the canvas module. Typecheck and owned-file Biome remain green:

```
pnpm typecheck
tsc --noEmit --incremental false
exit 0

pnpm check src/shared/components/spectral-background 'src/app/[locale]/globals.css'
Checked 277 files in 112ms. No fixes applied.
exit 0
```
