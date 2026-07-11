# Repository Health Implementation Plan

**Goal:** Make local and GitHub Actions quality gates reproducible, non-mutating, type-safe, and stable while remediating compatible dependency advisories.

## Tasks

1. Add non-mutating `typecheck`/`check` scripts; migrate CI from Bun to Corepack pnpm with frozen lockfile and a typecheck gate; update README.
2. Correct test mock contracts in instrumentation, blog repository, experience carousel, and chat widget tests.
3. Bound Vitest concurrency without changing test discovery or jsdom behavior.
4. Add titles to six checked SVG assets; install compatible dependency updates and review audit paths.
5. Verify lint, typecheck, tests, build, audit, and diff scope.

## Constraints

- Do not upgrade TypeScript 7 or `@types/node` 26.
- Do not change product-facing behavior.
- Do not commit, push, or open a pull request without explicit authorization.
