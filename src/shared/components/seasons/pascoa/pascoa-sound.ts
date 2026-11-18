import { playSeasonTones, type Tone } from '../shared/season-sound'

/** "Ploc": an egg found, a short hollow knock. */
const PLOC: Tone[] = [
  { f: 520, at: 0, d: 0.08, type: 'sine', v: 0.08 },
  { f: 780, at: 0.03, d: 0.06, type: 'triangle', v: 0.04 },
]

/** A few bright chimes for the chocolate egg. */
const CHIMES: Tone[] = [
  [1046.5, 0],
  [1318.51, 0.14],
  [1567.98, 0.28],
  [2093.0, 0.42],
].map(([f, at]) => ({ f, at, d: 0.6, type: 'sine' as const, v: 0.04 }))

export function playPloc(): () => void {
  return playSeasonTones(PLOC)
}

export function playChimes(): () => void {
  return playSeasonTones(CHIMES)
}
