# Seasons Engine and Réveillon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Christmas-only season code into an engine for every season of the year (year-wrapping and Easter-based windows, editions, a layer registry, shared pieces) and ship the Réveillon on it.

**Architecture:** The calendar becomes data plus one resolver (`seasons.ts`); the pre-paint init script repeats the resolver in plain JS and a test checks both agree day by day. Generic pieces leave `natal/` for `seasons/shared/`; `SeasonLayer` picks a lazy layer per season id. Réveillon lives in `seasons/reveillon/` with its own chunk and stylesheet.

**Tech Stack:** Next.js 16 App Router, React 19, zustand, Tailwind 4, Vitest + jsdom, Biome.

**Spec:** `docs/superpowers/specs/2026-11-18-seasons-2027-design.md` (and the Christmas spec `2026-11-17-seasonal-themes-design.md` for the shared rules).

## Global Constraints

- Réveillon window: 27/12 to 06/01, edition = year it starts. Carnaval = Easter − 57 to Easter − 46; Páscoa = Easter − 7 to Easter + 1; Junina 01/06–30/06; Halloween 24/10–01/11; Natal 25/11–26/12 (unchanged). Only Réveillon is added to `SEASONS` in this plan; the resolver supports all.
- Retro world always wins; every lazy-CSS rule on elements outside the layer is gated by `:root[data-season="<id>"]:not([data-retro])`.
- Nothing season-specific downloads outside the season; portrait preload only on home paths.
- `prefers-reduced-motion`: no ambient animation; interactions still possible.
- Sound off by default, shared key `season-sound`.
- Coverage floors: statements 86, branches 78, functions 86, lines 87. Biome a11y rules. No `backdrop-filter`.
- Copy in pt, en and es.
- Natal behaviour must not change (its tests stay green, only import paths move).

## Review Focus

- Tab hidden at midnight on 31/12: timers are throttled; the virada must still fire when the timer runs and must not fire twice (test in Task 9).
- Clicking a link, a button, a form field or selecting text must not launch a firework (test in Task 7).
- A Réveillon turn-off on 02/01/2027 is the 2026 edition and must be back on 27/12/2027 (test in Task 3).
- `?epoca=reveillon` in November: the countdown targets next year and the game saves under the coming edition (test in Task 3).
- Space or ArrowUp on the waves game must not scroll the page (test in Task 10).

---

### Task 1: Calendar resolver

**Files:**
- Modify: `src/shared/lib/seasons/seasons.ts`
- Test: `src/shared/lib/seasons/__tests__/seasons.test.ts`

**Interfaces:**
- Produces:
  - `type SeasonEdge = { month: number; day: number } | { easter: number }`
  - `type SeasonRule = { id: string; from: SeasonEdge; to: SeasonEdge }`
  - `easterSunday(year: number): Date` (local midnight)
  - `seasonWindows(year: number, rules?: readonly SeasonRule[]): SeasonWindow[]` where `SeasonWindow = { id: SeasonId; edition: number; from: number; to: number }`, `from`/`to` as `yyyymmdd` numbers; a fixed `to` earlier than `from` lands in `year + 1`.
  - `seasonWindowOn(date: Date): { id: SeasonId; edition: number } | null` (checks editions `year - 1` and `year`)
  - `seasonEdition(id: SeasonId, date: Date): number` — edition in course, else the next one.
  - `seasonOn(date)` keeps its signature. `seasonOffKey(id, edition)` keeps its shape.
  - `SEASONS` gains `{ id: 'reveillon', from: { month: 12, day: 27 }, to: { month: 1, day: 6 } }`.

- [ ] **Step 1: Failing tests**: `easterSunday` for 2024-03-31, 2025-04-20, 2026-04-05, 2027-03-28, 2038-04-25, 2285-03-22; `seasonWindowOn(new Date(2027,0,3))` → `{ id: 'reveillon', edition: 2026 }`; `seasonWindowOn(new Date(2026,11,27))` → edition 2026; `new Date(2027,0,7)` → null; a test rule list with `{ easter: -57 }..{ easter: -46 }` gives 2027-01-30..2027-02-10; `seasonEdition('reveillon', new Date(2026,10,18))` → 2026, `seasonEdition('reveillon', new Date(2027,0,2))` → 2026; no two `SEASONS` windows overlap for any day of 2026–2040.
- [ ] **Step 2:** `pnpm vitest run src/shared/lib/seasons` → FAIL.
- [ ] **Step 3:** Implement (Meeus/Jones/Butcher for Easter; `yyyymmdd = y*10000 + m*100 + d`).
- [ ] **Step 4:** Tests pass.
- [ ] **Step 5:** Commit `feat(seasons): calendar with year-wrapping and Easter-based windows`.

### Task 2: Init script on the same calendar

**Files:**
- Modify: `src/app/[locale]/theme-init-script.ts`
- Test: `src/app/[locale]/__tests__/head.test.ts`

**Interfaces:**
- Consumes: `SEASONS`, `seasonWindowOn` (Task 1).
- Produces: the script embeds `SEASONS` and a plain-JS resolver; off key = `season-off:<id>-<edition>`.

- [ ] **Step 1: Failing tests**: for every day 2026-01-01..2040-12-31 the attribute set by the script equals `seasonWindowOn(day)?.id` (clear attribute and storage between days); on 2027-01-02 with `season-off:reveillon-2026` = '1' no attribute; on 2027-01-02 with `season-off:reveillon-2027` the season stays on.
- [ ] **Step 2:** Run head tests → FAIL.
- [ ] **Step 3:** Rewrite the season block: an `easter(y)` function, `edge(e, y)`, windows for `y-1` and `y`, find today's window, off key by edition. Keep preview, retro and preload behaviour.
- [ ] **Step 4:** Head tests pass (all existing ones too).
- [ ] **Step 5:** Commit `feat(seasons): pre-paint script follows the full calendar`.

### Task 3: Store tracks the edition

**Files:**
- Modify: `src/shared/store/use-season/use-season.ts`
- Test: `src/shared/store/use-season/__tests__/use-season.test.ts`

**Interfaces:**
- Produces: store state `edition: number | null` beside `active`/`current`. `init()` sets it from `seasonWindowOn` or, for a preview, `seasonEdition(id, now)`. `setEnabled` writes `seasonOffKey(current, edition)`.

- [ ] **Step 1: Failing tests**: on 2027-01-02, `setEnabled(false)` writes `season-off:reveillon-2026`; on 2027-12-27 with that key set, `init()` → active `reveillon`, edition 2027; preview `reveillon` on 2026-11-18 → edition 2026.
- [ ] **Step 2–4:** Fail, implement, pass.
- [ ] **Step 5:** Commit `feat(seasons): turn-off and progress follow the season edition`.

### Task 4: Shared pieces out of `natal/`

**Files:**
- Create in `src/shared/components/seasons/shared/`: `use-slots.ts` (moved), `season-sound.ts`, `sound-toggle.tsx`, `fill.ts`, `use-today.ts`, `use-modal-dialog.ts`, `share-site.ts`, and their tests in `shared/__tests__/`.
- Modify: natal files to import from `../shared/...`; `natal/season-sound.ts` becomes `natal/natal-sound.ts` with `playBell`/`playJingle`.

**Interfaces:**
- Produces:
  - `useSlots(selector: string): Element[]` (unchanged)
  - `isSeasonSoundOn()`, `setSeasonSound(on)`, `onSeasonSoundChange(listener)`, `playSeasonTones(tones: readonly Tone[]): () => void`
  - `SoundToggle({ label, className, icon }: { label: string; className: string; icon: (on: boolean) => ReactNode })`
  - `fill(text: string, values: Record<string, string | number>): string`
  - `useToday(): Date` — re-renders at local midnight.
  - `useModalDialog(ref: RefObject<HTMLDialogElement | null>, open: boolean): RefObject<boolean>` — `showModal`, pause Lenis, close and resume on cleanup; returns an "is open" ref.
  - `shareSite({ locale, title, text }): Promise<'shared' | 'copied' | 'failed'>`
- [ ] **Step 1:** Move tests with the code (`use-slots`, `season-sound`), add tests for `useToday` (fake timers across midnight), `useModalDialog` (calls showModal, stop/start smooth scroll) and `shareSite` (share sheet, clipboard fallback).
- [ ] **Step 2:** Run → FAIL on new tests.
- [ ] **Step 3:** Move and extract; natal's globe, footer and hunt use the shared pieces.
- [ ] **Step 4:** `pnpm vitest run src/shared/components/seasons` all green.
- [ ] **Step 5:** Commit `refactor(seasons): share slots, sound, dialog and countdown pieces across seasons`.

### Task 5: Layer registry, tokens, slots, labels and Vega per season

**Files:**
- Modify: `season-layer.tsx`, `seasons.css`, `code-portrait.tsx` (`readColors` reads `--season-1..3`), `glyph-grid.ts`, `portrait-image.ts` (`SEASON_PORTRAITS`, `SEASON_PORTRAIT_CACHE_SOURCES`), `next.config.ts`, `home-body.tsx` (`<div data-season-slot="play" />` after closing), `site-header.tsx` (names for every `SEASONS` id from `prefs.seasons.<id>`), `vega-screen.tsx` (`season.<id>.greeting/suggestion` for the active season), `messages/{pt,en,es}.json`.
- Test: `season-layer.test.tsx`, `glyph-grid` tests, `vega` season test, `next.config` cache test if present.

**Interfaces:**
- Produces: `SEASON_LAYERS: Record<SeasonId, LazyExoticComponent<ComponentType<{ locale: string }>>>`; CSS tokens `--season-1`, `--season-2`, `--season-3` for every season; Vega suggestion receives `{ year: edition }`.
- [ ] Steps: failing tests (layer for `reveillon` lazily rendered; Vega greets "Feliz Ano Novo" when active is reveillon; natal still greets "Boas festas"), implement, pass, commit `feat(seasons): registry, tokens and labels for every season`.

### Task 6: Réveillon palette, portrait and layer shell

**Files:**
- Create: `src/shared/components/seasons/reveillon/{reveillon-layer.tsx,reveillon.css,reveillon-copy.ts}` and tests.
- Modify: `seasons.css` (reveillon tokens: gold `#8a6a12`/`#f2c14e`, champagne `#a3824a`/`#f7e7c4`, silver `#5d6b78`/`#d9e2ec`; accent override on default color only, AA on both themes), `portrait-image.ts` (`REVEILLON_PORTRAIT_IMAGE` from `/redesign/portrait/reveillon-v1`), `glyph-grid.ts` (`'·*✦✧+°'`).
- Public: `public/redesign/portrait/reveillon-v1/photo-{384,640,750,828,1080}.webp` (already generated).
- [ ] Steps: tests (copy for 3 locales has every key; init script preloads the reveillon photo on `/`), implement, pass, commit `feat(reveillon): palette, white-shirt portrait and layer shell`.

### Task 7: Fireworks

**Files:**
- Create: `reveillon/fireworks.ts`, `reveillon/fireworks-canvas.tsx`, `reveillon/fireworks-bus.ts`, tests.

**Interfaces:**
- Produces:
  - `type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: number }`, `type Rocket = { x; y; tx; ty; vy; trail: number }`
  - `launch(from: {x;y}, to: {x;y}): Rocket`, `explode(rocket, rand: () => number, count: number): Spark[]`, `stepFireworks(state: { rockets: Rocket[]; sparks: Spark[] }, dt: number, rand): void`, `isIdle(state): boolean`
  - `isEmptySpot(target: Element | null, selection: string): boolean` — false inside `a, button, input, select, textarea, label, summary, [role=button], [role=link], [tabindex], [contenteditable], dialog, [data-no-fireworks]` or with a non-empty selection.
  - `fireworksBus`: `launchAt(x, y)`, `finale(ms)`, `subscribe(listener)`.
  - Limits: 6 rockets at once, 420 sparks max; ambient every 4.5–8 s (phone 7–11 s), targets in the top 35% and the side 18% margins; the rAF loop stops when idle.
- [ ] Step 1 failing tests: `isEmptySpot` table (link, button child, text field, selected text → false; plain section → true); `stepFireworks` explodes a rocket at its target and sparks fade to idle; canvas launches on a document click on empty space and not on a link; reduced motion → no ambient timer, click draws once.
- [ ] Steps 2–5: fail, implement, pass, commit `feat(reveillon): fireworks that answer a click on empty space`.

### Task 8: Name shimmer and year counter

**Files:**
- Create: `reveillon/year-counter.tsx` (+ test); rules in `reveillon.css`.

**Interfaces:**
- Consumes: `useSlots('[data-season-slot="hero-lights"]')`, `fireworksBus.launchAt`, store `edition`.
- Produces: `YearCounter({ turned }: { turned: boolean })` portal: shows `edition` with the last digit rolling to `edition + 1` when `turned`; aria-hidden. Clicking the title launches a firework from it.
- [ ] Steps: failing tests (shows "2026" before, "2027" after `turned`; title click calls `launchAt`), implement (CSS shimmer: gradient sweep on `[data-letter]`, gated, static with reduced motion), pass, commit `feat(reveillon): golden shimmer on the name and a year counter`.

### Task 9: New-year countdown and the virada

**Files:**
- Create: `reveillon/countdown.ts`, `reveillon/footer-countdown.tsx`, `reveillon/virada.tsx`, tests.

**Interfaces:**
- Produces:
  - `newYearCountdown(now: Date, edition: number): { kind: 'days'; days: number } | { kind: 'hours'; hours: number; minutes: number } | { kind: 'new-year'; year: number }`
  - `midnightOf(edition: number): Date` (`new Date(edition + 1, 0, 1)`), `viradaFromParam(search: string, now: number): number | null` (`virada=5..120` seconds).
  - `Virada({ locale, onTurn })`: schedules at the target; last 10 s fixed marker (`aria-hidden`, a polite live region announces only the greeting); at 0 calls `fireworksBus.finale(8000)` and `onTurn()`; greeting "Feliz {year}" fades after 6 s; fires once even if the timer fires late (hidden tab) and re-arms on `visibilitychange`.
- [ ] Steps: failing tests (countdown at 2026-12-28 → days 4; 2026-12-31 19:48 → hours 4, minutes 12; 2027-01-03 → new-year 2027; virada fires once, late timer still fires once, param parsing), implement, pass, commit `feat(reveillon): countdown to midnight and the virada`.

### Task 10: "Pule as 7 ondas"

**Files:**
- Create: `reveillon/waves.ts`, `reveillon/waves-game.tsx`, `reveillon/wishes-card.tsx`, tests.

**Interfaces:**
- Produces:
  - `WISH_COUNT = 7`; `type WavesState = { waves: { x: number; jumped: boolean }[]; jumpT: number; cleared: number; missed: number; speed: number }`
  - `createWaves(cleared: number): WavesState`, `stepWaves(state, dt): 'cleared' | 'missed' | null`, `jump(state): void`, `jumpWindowOk(state): boolean`; after 2 misses `speed *= 0.75` (floor 0.5).
  - Progress `season-waves:reveillon-<edition>` (number 0–7) via `loadCleared(edition)` / `saveCleared(edition, n)`.
  - `WavesGame({ locale, edition, onComplete })` portal into `[data-season-slot="play"]`; a real "Pular" button; Space/ArrowUp on the focused stage jump with `preventDefault`; reduced motion → each jump clears a wave; polite announcement "Onda N de 7 pulada: <pedido>"; track `season-wave` and `season-hunt-complete`.
  - `WishesCard({ open, onClose, locale, edition })` native modal with the 7 wishes and share.
- [ ] Steps: failing tests (wave reaching the player while airborne clears; grounded misses; slowdown after 2 misses; keyboard jump prevents scroll; reduced motion clears per press; completion opens card and saves 7), implement, pass, commit `feat(reveillon): jump the seven waves for seven wishes`.

### Task 11: Sound and Vega copy

**Files:**
- Create: `reveillon/reveillon-sound.ts` (+ test). Modify messages (Task 5 keys filled for reveillon).
- Produces: `playPop()`, `playSplash()`, `playAuldLangSyne()` (traditional melody, ~3 s), all via `playSeasonTones`.
- [ ] Steps: test that nothing plays with sound off and tones play with it on; commit `feat(reveillon): sounds and Vega greeting`.

### Task 12: Visual check, docs, gates, PR

- [ ] Run `pnpm dev`, capture `/?epoca=reveillon` at 390 and 1280 px, light and dark, plus the waves game, the card and `&virada=15`; fix what looks wrong.
- [ ] Update `docs/redesign/assets.md` (reveillon photo) and the spec if decisions moved.
- [ ] Gates: `pnpm audit --prod --audit-level=high`, `pnpm lint`, `pnpm typecheck`, `pnpm knip`, `pnpm test:coverage`, `pnpm build`.
- [ ] Self-review with a fresh reviewer; fix every finding, minor ones included.
- [ ] Push and open a draft PR with captures; do not merge before the owner approves.
