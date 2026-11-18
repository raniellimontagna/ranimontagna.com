# Páscoa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Easter season: painted-egg name, a hopping bunny, the portrait in a lilac t-shirt with painted eggs behind, a countdown and an egg hunt that ends in a chocolate egg.

**Architecture:** As Réveillon and Carnaval. The hidden hunt leaves `natal/` for `seasons/shared/` (storage, hook and slot portals), so Christmas, Easter and Halloween share it; Christmas keeps its storage key and behaviour.

**Tech Stack:** Next.js 16, React 19, Vitest + jsdom, Biome.

**Spec:** `docs/superpowers/specs/2026-11-18-seasons-2027-design.md` (section "Páscoa").

## Global Constraints

- Window: Easter − 7 (Palm Sunday) to Easter + 1 (Monday). 2027: 21/03 to 29/03.
- Palette: chocolate `#6b3e26` (light) / `#c99063` (dark); pastels for decoration `--season-lilac #c9b6f2`, `--season-mint #a8e6cf`, `--season-pink #f6b8d0`, `--season-butter #ffe8a3`; paint on the name in light mode uses deep tones (`#6d4fa0`, `#22735f`, `#a3386a`, `#6b3e26`), each ≥ 3:1 on the light background (large text). Accent: chocolate (light) / lilac (dark).
- Same rules: gated CSS, nothing outside the season, reduced motion, sound off by default, pt/en/es.

## Review Focus

- The egg paint must stay readable: every band ≥ 3:1 on its background in both themes (test in Task 3).
- Christmas progress saved as `season-gifts:natal-<year>` must survive the hunt refactor (test in Task 2).
- The bunny never takes a click and never runs with reduced motion or a hidden tab (test in Task 4).
- An egg found on one page stays found after navigating (test in Task 5).
- Easter Monday still wishes a happy Easter, not "0 days" (test in Task 6).

---

### Task 1: Calendar, palette, portrait, labels
Rule `{ id: 'pascoa', from: { easter: -7 }, to: { easter: 1 } }`, tokens and accent in `seasons.css`, `pascoa: '/redesign/portrait/pascoa-v1'`, glyphs `'o°·*✿+'`, registry, `prefs.seasons.pascoa` (Páscoa / Easter / Pascua), Vega greeting and question. Tests: `seasonOn` for 2027-03-20 (null), 21 and 29 (pascoa), 30 (null); preload on `/`; Vega greeting.

### Task 2: The hunt, shared
`shared/hunt.ts`: `HUNT_SPOTS` (the five home spots), `huntKey(season, edition)` = `season-gifts:<season>-<edition>`, `loadFound`, `saveFound`, `addFound`, `isComplete`. `shared/use-hunt.ts`: `useHunt({ season, edition, onFind, onComplete })` → `{ found, find }` (a ref against double counting, tracks `season-gift` and `season-hunt-complete`). `shared/hunt-spots.tsx`: `HuntSpots({ render })` portals one item per `[data-season-gift]`. Christmas's `Hunt` uses them. Tests: natal key unchanged; existing Christmas hunt tests green.

### Task 3: Painted name
`pascoa/egg-paint.tsx` sets `data-pintura` (listras → bolinhas → zigue-zague) on the title and cycles on click; `pascoa.css` paints each letter with `background-clip: text` (per letter, so the letters' own transform is fine). Tests: cycling and cleanup; CSS test lists the paint colours and checks contrast.

### Task 4: Hopping bunny
`pascoa/bunny.tsx`: every 25–40 s (phones 40–60 s) a bunny crosses the bottom edge in hops, leaving footprints that fade; CSS animations only, removed on `animationend`. Not with reduced motion, not in a hidden tab, `pointer-events: none`, `aria-hidden`.

### Task 5: Egg hunt and the chocolate egg
`pascoa/egg-hunt.tsx` (egg buttons in the five spots, a counter with sound and reopen), `pascoa/easter-card.tsx` (native modal, a chocolate egg that cracks open, card, share), `pascoa/pascoa-sound.ts` (`playPloc`, `playChimes`).

### Task 6: Countdown and layer
`pascoa/countdown.ts` (`easterCountdown(now, edition)` → days to Sunday, then `easter` on Sunday and Monday), footer, `pascoa-layer.tsx`, captures, gates, review, draft PR.
