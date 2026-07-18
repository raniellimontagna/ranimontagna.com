# Task 5 Report: Global mounting, section zones, and grid removal

## Status

PASS

## RED evidence

Command:

```bash
pnpm exec vitest run src/features/home/components/hero/__tests__/hero.test.tsx src/features/home/components/about/__tests__/about.test.tsx src/features/home/components/experience/__tests__/experience.test.tsx src/features/home/components/services/__tests__/services.test.tsx src/features/home/components/projects/__tests__/projects.test.tsx src/features/home/components/contact/__tests__/contact.test.tsx src/features/projects/__tests__/projects-page.test.tsx src/features/blog/__tests__/blog-page.test.tsx src/shared/components/ui/__tests__/error-view.test.tsx 'src/app/[locale]/__tests__/layout.spectral-background.test.tsx'
```

Result: exit `1`; 10 test files failed, with 11 expected assertion failures and 12 pre-existing assertions passing. Failures showed the missing `data-spectral-zone` markers and missing global background mount.

## GREEN evidence

The same focused command passed with exit `0`: 10 test files and 23 tests passed.

Additional verification:

- `rg -n "atmospheric-grid" src` returned no output and exit `1`.
- `pnpm typecheck` exited `0`.
- `pnpm check` exited `0`, checking 283 files with no fixes applied.
- `git diff --check` exited `0`.

## Implementation notes

- The locale layout mounts one `SpectralBackground` as the first body child.
- Zone markers are `hero` for hero, `balanced` for about/experience/services/projects and the projects index, `focus` for contact, and `quiet` for blog index/article and `ErrorContent`.
- All obsolete grid nodes and the global grid CSS rule were removed.
- Broad section/page ambient glow layers were removed. Card-local highlights, portrait lighting, terminal/status lighting, and focus styles remain.
- Blog index and article assertions directly render their async route components. The MDX renderer alone is mocked in the article test so the route-shell zone contract is exercised without invoking the RSC MDX runtime.
- Unrelated dirty chatbot files and user documents were not edited or staged.

## Self-review

- Existing ids, test ids, content, spacing, and interaction code remain unchanged.
- The background is not mounted in the root layout, home page, or individual routes.
- No owned change reaches `src/app/api/chat/*`, `PRODUCT.md`, or the 2026-07-12 planning documents.

## Review fixes

### RED evidence

The combined Task 2 and Task 5 integration command failed with exit `1`: 5 expected failures and 27 passing tests across 11 test files. The failures proved that deferred zone markers were not discovered or cleaned up and that the projects/blog route shells still used the exact opaque `bg-background` token.

### GREEN evidence

Command:

```bash
pnpm exec vitest run src/shared/components/spectral-background/__tests__/use-spectral-environment.test.tsx src/features/home/components/hero/__tests__/hero.test.tsx src/features/home/components/about/__tests__/about.test.tsx src/features/home/components/experience/__tests__/experience.test.tsx src/features/home/components/services/__tests__/services.test.tsx src/features/home/components/projects/__tests__/projects.test.tsx src/features/home/components/contact/__tests__/contact.test.tsx src/features/projects/__tests__/projects-page.test.tsx src/features/blog/__tests__/blog-page.test.tsx src/shared/components/ui/__tests__/error-view.test.tsx 'src/app/[locale]/__tests__/layout.spectral-background.test.tsx'
```

Result: exit `0`; 11 test files and 32 tests passed.

Additional review verification:

- `pnpm typecheck` exited `0`.
- Biome checked the 7 changed source/test files with no errors or fixes.
- `rg -n "atmospheric-grid" src` returned no output and raw exit `1`.
- `git diff --check` exited `0`.

### Review implementation notes

- The zone effect now observes body child-list mutations throughout the subtree, discovers deferred valid markers once, unobserves removed markers, deletes their candidates, recomputes the active zone, and disconnects both zone observers on cleanup.
- The root theme observer and missing `MutationObserver`/`IntersectionObserver` fallbacks remain independent and intact.
- Projects index, blog index, and blog article outer shells now consistently use `bg-background/80`; inner content and card surfaces are unchanged.
