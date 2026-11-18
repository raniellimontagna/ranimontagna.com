import { playSeasonTones, type Tone } from '../shared/season-sound'

/** A small sleigh bell: two bright partials, quick decay. */
const BELL: Tone[] = [
  { f: 1318.51, at: 0, d: 0.45, type: 'triangle', v: 0.06 },
  { f: 1975.53, at: 0, d: 0.3, type: 'sine', v: 0.035 },
  { f: 1567.98, at: 0.09, d: 0.35, type: 'triangle', v: 0.04 },
]

/** The opening of "Jingle Bells" (traditional, 1857), for the snow globe. */
const JINGLE: Tone[] = [
  [659.25, 0],
  [659.25, 0.2],
  [659.25, 0.4],
  [659.25, 0.8],
  [659.25, 1.0],
  [659.25, 1.2],
  [659.25, 1.6],
  [783.99, 1.8],
  [523.25, 2.0],
  [587.33, 2.3],
  [659.25, 2.4],
].map(([f, at]) => ({ f, at, d: 0.22, type: 'triangle' as const, v: 0.05 }))

export function playBell(): () => void {
  return playSeasonTones(BELL)
}

export function playJingle(): () => void {
  return playSeasonTones(JINGLE)
}
