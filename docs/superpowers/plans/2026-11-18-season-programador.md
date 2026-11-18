# Dia do Programador Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Programmer's Day season: syntax colours, rising code tokens, the highlighted name with a caret, the rubber-duck portrait, a countdown to day 256 and a five-PR code review game.

**Architecture:** As the other seasons (`seasons/junina/` is the model). The calendar learns a third edge, `{ yearDay: n }`, in `seasons.ts` and in the init script; the every-day parity test in `head.test.ts` covers it once the rule is in `SEASONS`.

**Tech Stack:** Next.js 16, React 19, next-intl, Vitest + Testing Library (jsdom), Biome, canvas 2D, Web Audio via `playSeasonTones`.

**Spec:** `docs/superpowers/specs/2026-11-18-season-programador-design.md`

## Global Constraints

- id `programador`; window `{ yearDay: 251 }` to `{ yearDay: 257 }`; day 256 = 13/09 (12/09 in leap years).
- Palette (light / dark): keyword `#6d28d9` / `#c4b5fd`, string `#15803d` / `#4ade80`, number `#a16207` / `#fbbf24`, function `#0e7490` / `#22d3ee`. Trio = keyword, string, function. Accent (no colour theme): `#15803d` light, `#4ade80` dark.
- Labels: "Dia do Programador" / "Programmer's Day" / "Día del Programador".
- Every rule outside the layer under `:root[data-season="programador"]:not([data-retro])`; play slot held before paint at the game's real height; sound off by default; pt/en/es; reduced motion respected; no `steps()` blinking; animate `translate`/`color`/`opacity`, never `transform`, on the name letters.
- Storage key for the game: `season-review:programador-<edition>` (number of PRs approved).

## Review Focus

- Leap years: day 256 is 12/09 in 2028 and 2032; the countdown and the window must follow (tests in Task 1 and Task 4).
- Tokens never take a click, pause with a hidden tab, stay still with reduced motion, and a click on a link or text selection spawns nothing (test in Task 3).
- Every code line is a real button with its line number in its name; keyboard focus lands on "Next PR" after a hit and on the card button at the end (test in Task 5).
- A PR approved on one visit stays approved after a reload in the same edition, and corrupt or blocked storage starts over without throwing (test in Task 5).
- The code lines fit at 390 px without horizontal page scroll (the listing scrolls inside itself; capture check in Task 6).

---

### Task 1: Calendar edge, rule, palette, labels, glyphs, Vega

**Files:**
- Modify: `src/shared/lib/seasons/seasons.ts`, `src/app/[locale]/theme-init-script.ts`, `src/shared/components/seasons/seasons.css`, `src/features/home/components/portrait/glyph-grid.ts`, `src/features/home/components/portrait/portrait-image.ts`, `messages/{pt,en,es}.json`
- Create: `src/shared/components/seasons/programador/programador-layer.tsx` (renders the parts as later tasks add them), `programador.css`
- Modify: `src/shared/components/seasons/season-layer.tsx`
- Test: `src/shared/lib/seasons/__tests__/seasons.test.ts`, `src/app/[locale]/__tests__/head.test.ts`, `src/features/home/components/portrait/__tests__/glyph-grid.test.ts`, `src/shared/vega/__tests__/vega-screen.test.tsx`, `src/shared/components/seasons/__tests__/season-layer.test.tsx`

**Interfaces:**
- Produces: `SeasonEdge = { month; day } | { easter } | { yearDay: number }`; `'programador'` in `SeasonId`; `ProgramadorLayer({ locale })`.

- [ ] Tests: `seasonOn` table rows `[at(9, 7, 23, 59, 2027), null]`, `[at(9, 8, 0, 0, 2027), 'programador']`, `[at(9, 13, 12, 0, 2027), 'programador']`, `[at(9, 14, 23, 59, 2027), 'programador']`, `[at(9, 15, 0, 0, 2027), null]`, `[at(9, 13, 23, 59, 2028), 'programador']`, `[at(9, 14, 0, 0, 2028), null]`; `seasonWindows` with a `{ yearDay }` rule places 2028's day 256 on `20280912`; head test: day-of-year rules agree with the calendar every day to 2040 (like the Easter test) and the duck photo preloads on `/` in season; glyph set `'01{};/'`; Vega greets with "Oi, eu sou a Vega. Feliz Dia do Programador!" and "Como o Ranielli começou a programar?"; season layer loads `programador` in `es`.
- [ ] Implement: `edgeDate` handles `yearDay` as `new Date(year, 0, n)`; the init script's `edge` does the same; palette tokens and accent in `seasons.css`; labels and `vega.season.programador` in the 3 locales; portrait dir `/redesign/portrait/programador-v1` (files land in Task 2).
- [ ] Run the touched tests; commit `feat(seasons): Programmer's Day calendar, palette and labels`.

### Task 2: Rubber-duck portrait

- [ ] Generate with Codex (`~/Projetos/pessoal/fotos/2026-11-perfil/scripts/codex-editar-base.sh`): dark hoodie and a yellow rubber duck on the shoulder; compose over today's photo with `compor-epoca.py` (face and hands original); triage at 512 px.
- [ ] Encode the 5 widths (384, 640, 750, 828, 1080) as WebP into `public/redesign/portrait/programador-v1/`, sized like the other seasons (≤ 55 KB at 750 px).
- [ ] Commit `feat(seasons): rubber-duck portrait for Programmer's Day`.

### Task 3: Code tokens rising, a burst on an empty click

**Files:** Create `programador/tokens.ts`, `programador/tokens-canvas.tsx`, `programador/tokens-bus.ts`; tests beside them.

**Interfaces:**
- `TOKENS: readonly string[]` = `['{}', '=>', ';', '</>', '0x100', '&&', '()', '[]', '//', '++']`
- `tokensCount(width, height, coarse): number` (one per 60 000 px², min 6, max 18; 10 on coarse)
- `createTokens(count, width, height, rand): Token[]`, `stepTokens(tokens, dt, width, height, pointer, rand): void`, `burst(x, y, rand): Token[]` (8 tokens, outward, short life)
- `tokensBus.burstAt(x, y)` for the name click.

- [ ] Tests: count bounds; tokens rise and dodge the pointer (as `sparks.test.ts`); a reborn token starts below the screen; burst gives 8 tokens around the point; canvas: no pointer events, paused when hidden, still with reduced motion, a click on an empty spot bursts and a click on a link or with a selection does not, theme change re-reads the palette.
- [ ] Implement on the `sparks-canvas.tsx` pattern; draw with `fillText` in the site's mono font, alpha 0.35 (bursts 0.8 fading), colours from `--season-keyword`, `--season-string`, `--season-number`, `--season-function`.
- [ ] Commit `feat(seasons): rising code tokens`.

### Task 4: Highlighted name with a caret; countdown to day 256

**Files:** Create `programador/highlight-name.tsx`, `programador/countdown.ts`, `programador/footer-countdown.tsx`, `programador/programador-copy.ts`, `programador/programador-sound.ts`; CSS in `programador.css`.

**Interfaces:**
- `programadorCountdown(now, edition): { kind: 'days'; days } | { kind: 'day' } | { kind: 'after' }` (target `new Date(edition, 0, 256)`)
- `getProgramadorCopy(locale)`; `playKey()`, `playHit()`, `playBuild()`.

- [ ] Tests: countdown 2027-09-12 → 1 day, 2027-09-13 → `day`, 2027-09-14 → `after`, 2028-09-12 → `day`; footer texts in pt/en/es (`return 0;` after); the name gets `data-scheme` 0 → 1 → 2 → 0 on clicks, opts out of page clicks, bursts tokens from the click point; the caret sits after the last letter of the second line; CSS test: letter colours and the caret blink live under the season gate, blink only with `prefers-reduced-motion: no-preference`, no `steps(`.
- [ ] Implement like `candle-name.tsx` (slot `hero-lights`, `textBox`, `ResizeObserver`, idle when off screen); schemes: 0 = keyword/function, 1 = string/number, 2 = all string (phosphor).
- [ ] Commit `feat(seasons): highlighted name and countdown to day 256`.

### Task 5: Code review game and the LGTM card

**Files:** Create `programador/review.ts`, `programador/review-game.tsx`, `programador/lgtm-card.tsx`; copy in `programador-copy.ts`.

**Interfaces:**
- `PR_COUNT = 5`; `loadApproved(edition): number`, `saveApproved(edition, n): void` (clamped 0–5).
- Copy: `prs: readonly { title; lines: readonly string[]; bug: number; why: string }[]` (code identical in the 3 locales).

- [ ] Tests: storage round trip, clamping, corrupt and blocked storage → 0; the game shows PR 1 of 5, each line a button named "Linha {n}: {code}"; a clean line says "Essa linha está ok" and stays; the bug line marks found, shows the explanation, tracks `season-gift` with `gift: 'pr-1'`, plays the hit sound and focuses "Próximo PR"; after the fifth, focus goes to "Ver aprovação", `recordCompleteOnce('programador', edition)` runs and the card opens; reload in the same edition resumes at the saved PR; idle when off screen; the card lists the 5 bugs, shares, copies the link and closes on Esc.
- [ ] Implement like `pescaria-game.tsx` and `arraia-card.tsx`; the listing scrolls inside itself (`overflow-x: auto`) at 390 px.
- [ ] Commit `feat(seasons): code review game and LGTM card`.

### Task 6: Captures, gates, review, draft PR

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test --coverage`, `pnpm knip`, `pnpm build` green.
- [ ] Captures at 390 and 1280 px, light and dark, with `?epoca=programador` on `next dev` at localhost; measure the play slot and set its `min-height` in `seasons.css`.
- [ ] Update the local review page; review the branch (fresh reviewer), fix every minor with a test; draft PR with captures.
