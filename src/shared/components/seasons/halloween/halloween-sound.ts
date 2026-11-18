import { playSeasonTones, type Tone } from '../shared/season-sound'

/** A witch's cackle: quick high notes falling, a little out of tune. */
const CACKLE: Tone[] = [988, 932, 880, 831, 784, 740, 698, 659].flatMap((f, i) => [
  { f, at: i * 0.11, d: 0.09, type: 'sawtooth' as const, v: 0.018 },
  { f: f * 1.03, at: i * 0.11 + 0.02, d: 0.06, type: 'square' as const, v: 0.008 },
])

/** A squashed bug: a short low crunch. */
const SQUASH: Tone[] = [
  { f: 140, at: 0, d: 0.06, type: 'square', v: 0.03 },
  { f: 70, at: 0.02, d: 0.1, type: 'triangle', v: 0.06 },
]

export function playCackle(): () => void {
  return playSeasonTones(CACKLE)
}

export function playSquash(): () => void {
  return playSeasonTones(SQUASH)
}
