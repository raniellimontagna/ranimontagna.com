# Repository Health Design

## Goal

Make the repository's local and CI quality gates reproducible, non-mutating, and capable of catching the current test type errors and dependency security issues before code reaches `main`.

## Scope

- Use pnpm and the committed `pnpm-lock.yaml` in CI.
- Add an explicit non-emitting TypeScript typecheck gate.
- Correct the existing test-source type errors without changing product behavior.
- Configure Vitest for bounded parallelism so the full suite can complete in constrained CI environments.
- Make the `check` command non-mutating and document the separate fix command.
- Resolve SVG accessibility warnings with a non-empty `<title>` naming the represented organization or country.
- Update compatible dependency releases and remediate production audit findings with supported upgrades or narrowly scoped pnpm overrides.

## Non-goals

- No TypeScript 7 or `@types/node` 26 major-version migration in this change.
- No product-feature, visual-design, or application-behavior changes.

## Verification

The completed work must pass lint, typecheck, the complete Vitest suite, production build, and a production dependency audit. CI must use Corepack pnpm plus `--frozen-lockfile` and run lint, typecheck, tests, and build.
