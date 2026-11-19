import { playSeasonTones, type Tone } from '../shared/season-sound'

/** A mechanical key: a short high tick over a low thock. */
const KEY: Tone[] = [
  { f: 1900, at: 0, d: 0.018, type: 'square', v: 0.008 },
  { f: 140, at: 0, d: 0.04, type: 'triangle', v: 0.02 },
]

/** A bug found: a quick rising pair. */
const HIT: Tone[] = [
  { f: 659.25, at: 0, d: 0.09, type: 'sine', v: 0.03 },
  { f: 987.77, at: 0.08, d: 0.16, type: 'sine', v: 0.03 },
]

/** "Build passing": a bright arpeggio up the C major chord. */
const BUILD: Tone[] = [523.25, 659.25, 783.99, 1046.5].map((f, i) => ({
  f,
  at: i * 0.11,
  d: i === 3 ? 0.5 : 0.14,
  type: 'triangle' as const,
  v: 0.03,
}))

export function playKey(): () => void {
  return playSeasonTones(KEY)
}

export function playHit(): () => void {
  return playSeasonTones(HIT)
}

export function playBuild(): () => void {
  return playSeasonTones(BUILD)
}
