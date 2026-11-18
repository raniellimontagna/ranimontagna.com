# Carnaval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Carnaval season on the engine from `2026-11-18-seasons-engine-reveillon.md`: confetti, a dancing name, a carnival portrait, a countdown and "Batize seu bloco".

**Architecture:** Same shape as Réveillon: calendar line, tokens in `seasons.css`, portrait folder, registry entry, and a lazy `seasons/carnaval/` layer with its own CSS.

**Tech Stack:** Next.js 16, React 19, Vitest + jsdom, Biome.

**Spec:** `docs/superpowers/specs/2026-11-18-seasons-2027-design.md` (section "Carnaval").

## Global Constraints

- Window: Easter − 57 to Easter − 46 (2027: 30/01 to 10/02). Carnival days: Easter − 50 (Saturday) to Easter − 47 (Tuesday); Ash Wednesday = Easter − 46.
- Palette (light / dark): magenta `#b0125a` / `#ff5fa2`, yellow `#8a5a00` / `#ffd23f`, cyan `#0b6e80` / `#22d3ee`, green `#15803d` / `#4ade80`. Trio = magenta, yellow, cyan. Default-colour accent: magenta, AA on both themes.
- Same rules as before: gated CSS, nothing outside the season, reduced motion, sound off by default, copy in pt/en/es, Christmas and Réveillon untouched.

## Review Focus

- The dancing name must not break the letters' rise on load: it animates `translate`/`rotate`, never `transform` (test in Task 4).
- A click on the name changes the rhythm and must not also burst confetti (test in Task 4).
- The bloco name must survive a reload in the same edition and change in the next one (test in Task 6).
- Confetti bursts must not pile up: pieces from a burst leave and are dropped (test in Task 3).
- The countdown on Ash Wednesday says the season is over, not "0 days" (test in Task 5).

---

### Task 1: Calendar, palette, portrait, labels

**Files:** `seasons.ts` (rule `{ id: 'carnaval', from: { easter: -57 }, to: { easter: -46 } }`), `seasons.css` (tokens `--season-magenta/-yellow/-cyan/-green`, trio, accent, show/hide, play-slot height `21rem`), `portrait-image.ts` (`carnaval: '/redesign/portrait/carnaval-v1'`), `glyph-grid.ts` (`'•◦*+✦·'`), `season-layer.tsx` (registry), messages (`prefs.seasons.carnaval`: Carnaval / Carnival / Carnaval; `vega.season.carnaval.greeting/suggestion`).
- [ ] Failing tests: `seasonOn(2027-02-09)` → `carnaval`, `2027-01-29` → null, `2027-02-11` → null; preload of the carnaval photo on `/` on 2027-02-01; Vega greets "Oi, eu sou a Vega. Bom Carnaval!".
- [ ] Implement, pass, commit `feat(carnaval): calendar, palette, portrait and labels`.

### Task 2: Copy

`carnaval/carnaval-copy.ts`: countdown texts, game texts, 24 bloco names per language (curated, no generated grammar), share text. Test: same keys and 24 names in every language, no duplicates.

### Task 3: Confetti

**Files:** `carnaval/confetti.ts`, `carnaval/confetti-canvas.tsx`.
- `type Piece = { x; y; vx; vy; spin; angle; size; shape: 'dot' | 'strip'; color: number; burst: boolean }`
- `createConfetti(count, w, h, rand)`, `stepConfetti(pieces, dt, w, h, pointer, rand)` (fall 0.03–0.07 px/ms with sway, the pointer blows pieces away within 110 px, ambient pieces wrap to the top, burst pieces are dropped once below the bottom), `burstConfetti(pieces, x, y, rand, count = 36)` (upward cone), `MAX_PIECES = 240`, `confettiCount(w, h, coarse)` (desktop ≤ 70, phone ≤ 40).
- Canvas: like the snow (fixed, pointer-events none, z-30, pauses hidden, reduced motion draws a still sprinkle once); a click on empty space (`isEmptySpot` from Réveillon, moved to `shared/empty-spot.ts`) bursts confetti there.
- [ ] Tests: burst pieces leave and are dropped; ambient count stays; pointer pushes a nearby piece away; canvas bursts on empty click and not on a link; still sprinkle with reduced motion.
- [ ] Commit `feat(carnaval): confetti that the pointer blows away`.

### Task 4: The name dances

**Files:** `carnaval/name-rhythm.tsx`, rules in `carnaval/carnaval.css`.
- Letters animate `translate`, `rotate` and `color` in a wave (inline stagger of the rise), never `transform`; rhythms `samba` (3.2 s), `frevo` (1.6 s), `marchinha` (2.4 s) by `data-ritmo` on the title; nothing with reduced motion.
- `NameRhythm()` sets `data-ritmo` and `data-no-fireworks` on `[data-hero-title]`, cycles on click, removes both on unmount.
- [ ] Tests: cycles samba → frevo → marchinha → samba; cleans up; CSS test: keyframes never touch `transform`.
- [ ] Commit `feat(carnaval): the name dances to three rhythms`.

### Task 5: Countdown

`carnaval/countdown.ts`: `carnavalCountdown(now, edition)` → `{ kind: 'days'; days }` before Saturday, `{ kind: 'carnaval' }` Saturday to Tuesday, `{ kind: 'ashes' }` on Wednesday. `carnaval/footer-countdown.tsx` with `useToday`.
- [ ] Tests for 2027: 30/01 → 7 days; 06/02 and 09/02 → carnaval; 10/02 → ashes; English copy.
- [ ] Commit `feat(carnaval): countdown in the footer`.

### Task 6: "Batize seu bloco"

**Files:** `carnaval/bloco.ts` (`pickBloco(previous, rand)` never repeats the last name; `loadBloco(edition)` / `saveBloco(edition, index)` under `season-bloco:carnaval-<edition>`), `carnaval/bloco-game.tsx` (portal into the play slot: title, intro, an SVG estandarte with fringe and the name, "Sortear nome", "Compartilhar"; polite announcement of the new name; tracks `season-bloco` with the index; plays the batucada with sound on), `carnaval/carnaval-sound.ts` (`playWhistle`, `playBatucada`).
- [ ] Tests: first visit shows the invitation and no name; a draw shows a name, saves it, announces it and never repeats the previous; reload keeps it; next edition starts fresh; share copies the link; sounds only with sound on.
- [ ] Commit `feat(carnaval): name your carnival bloco`.

### Task 7: Layer, visual check, gates, PR

- [ ] `carnaval-layer.tsx` composes confetti, name rhythm, footer and the game; layer test.
- [ ] Captures at 390/1280, light/dark, game with a drawn name; fix what looks wrong.
- [ ] Gates, fresh review, minors fixed, draft PR stacked on Réveillon.
