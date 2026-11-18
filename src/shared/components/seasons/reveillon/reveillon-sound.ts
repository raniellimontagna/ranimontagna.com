import { playSeasonTones, type Tone } from '../shared/season-sound'

/** A soft firework pop: a low thump and a few crackles. */
const POP: Tone[] = [
  { f: 180, at: 0, d: 0.14, type: 'triangle', v: 0.08 },
  { f: 2600, at: 0.05, d: 0.05, type: 'square', v: 0.012 },
  { f: 3100, at: 0.1, d: 0.04, type: 'square', v: 0.01 },
  { f: 2200, at: 0.15, d: 0.04, type: 'square', v: 0.01 },
]

/** A splash as a wave goes under the jump. */
const SPLASH: Tone[] = [
  { f: 900, at: 0, d: 0.12, type: 'sine', v: 0.04 },
  { f: 700, at: 0.04, d: 0.12, type: 'sine', v: 0.035 },
  { f: 520, at: 0.08, d: 0.16, type: 'sine', v: 0.03 },
]

/** The opening of "Auld Lang Syne" (traditional Scottish air), for the card and the virada. */
const AULD_LANG_SYNE: Tone[] = [
  [392.0, 0, 0.4],
  [523.25, 0.42, 0.6],
  [523.25, 1.05, 0.2],
  [523.25, 1.26, 0.4],
  [659.25, 1.68, 0.4],
  [587.33, 2.1, 0.6],
  [523.25, 2.73, 0.2],
  [587.33, 2.94, 0.4],
  [659.25, 3.36, 0.4],
  [523.25, 3.78, 0.6],
  [523.25, 4.41, 0.2],
  [659.25, 4.62, 0.4],
  [783.99, 5.04, 0.4],
  [880.0, 5.46, 0.9],
].map(([f, at, d]) => ({ f, at, d, type: 'triangle' as const, v: 0.05 }))

export function playPop(): () => void {
  return playSeasonTones(POP)
}

export function playSplash(): () => void {
  return playSeasonTones(SPLASH)
}

export function playAuldLangSyne(): () => void {
  return playSeasonTones(AULD_LANG_SYNE)
}
