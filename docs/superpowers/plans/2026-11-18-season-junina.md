# Festa Junina Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Festa Junina season: bunting over the name, bonfire sparks, the straw-hat portrait, a countdown to São João and a fishing game with prizes.

**Architecture:** As the other seasons. The strand geometry of Christmas's string lights moves to `seasons/shared/strands.ts`, so the bunting hangs on the same measured wire.

**Spec:** `docs/superpowers/specs/2026-11-18-seasons-2027-design.md` (section "Festa Junina").

## Global Constraints

- Window: 01/06 to 30/06. São João = 24/06.
- Palette (light / dark): red `#b3261e` / `#ff6b5b`, yellow `#8a5a00` / `#ffd23f`, blue `#1d4ed8` / `#60a5fa`, green `#15803d` / `#4ade80`, bonfire orange `#c2410c` / `#fb923c`. Trio = red, yellow, blue. Accent: orange.
- Portrait re-encoded at WebP q58 (the plaid is heavy): 53 KB at 750 px.
- Same rules: gated CSS, nothing outside the season, reduced motion, sound off by default, pt/en/es; play slot held at the game's real height.

## Review Focus

- The bunting must not cover the letters: room above the name is held before paint (test in Task 3).
- Sparks never take a click, pause with a hidden tab and stay still with reduced motion (test in Task 4).
- Fish are real buttons that keyboard users can catch, and they stand still with reduced motion (test in Task 6).
- A fish caught on one visit stays caught after a reload in the same edition (test in Task 6).
- The countdown on 24/06 says "Viva São João!", never "0 days" (test in Task 5).

### Task 1: Calendar, palette, portrait, labels
### Task 2: Shared strand geometry (Christmas lights keep working)
### Task 3: Bunting on the name, swaying; a click brings a gust
### Task 4: Bonfire sparks rising from the bottom, avoiding the pointer
### Task 5: Countdown to São João (days; "Viva São João!" on the 24th; "Arraiá até o fim do mês" after)
### Task 6: Pescaria: five paper fish in a pond; each catch reveals a prize (a project of Ranielli's); five catches open the "Arraiá do Ranielli" card with the prizes and a share button
### Task 7: Layer, captures, gates, review, draft PR
