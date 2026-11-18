# Halloween Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Halloween season: bats that flee the pointer, a candle-lit name with a cobweb, the vampire-cape portrait, a countdown and a bug hunt that ends with "zero bugs in production".

**Architecture:** As the other seasons; the bug hunt runs on the shared hunt (`useHunt`, `HuntSpots`).

**Spec:** `docs/superpowers/specs/2026-11-18-seasons-2027-design.md` (section "Halloween").

## Global Constraints

- Window: 24/10 to 01/11.
- Palette (light / dark): pumpkin `#b45309` / `#ff8a3d`, purple `#6b21a8` / `#c084fc`, slime `#3f6212` / `#a3e635`. Trio = pumpkin, purple, slime. Accent: pumpkin.
- Same rules: gated CSS, nothing outside the season, reduced motion, sound off by default, pt/en/es.

## Review Focus

- Bats never take a click, stop in a hidden tab and never fly with reduced motion (test in Task 3).
- The flicker on the name animates only `color` and `text-shadow`, never `transform` (test in Task 4).
- A squashed bug stays squashed across pages and reloads in the same edition (test in Task 5).
- The finished hunt is recorded once per edition (shared `useHunt`, test in Task 5).
- 31/10 says "Feliz Halloween", never "0 days"; 01/11 says goodbye until next year (test in Task 6).

### Task 1: Calendar, palette, portrait, labels
### Task 2: Copy and sounds (cackle, squash)
### Task 3: Bats: a few cross the screen every 15–25 s, flapping, and veer away from the pointer; a click on the name sends one out of it
### Task 4: The name flickers like candlelight; a small cobweb hangs by the name
### Task 5: Bug hunt: five little spiders in the home spots, squashed with a click ("corrigido"); five open the "Zero bugs em produção" card
### Task 6: Countdown and layer, captures, gates, review, draft PR
