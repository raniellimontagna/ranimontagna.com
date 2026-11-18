import { playSeasonTones, type Tone } from '../shared/season-sound'

/** An accordion chord: three reedy voices, each a pair slightly out of tune. */
const chord = (at: number, notes: number[], d: number): Tone[] =>
  notes.flatMap((f) => [
    { f, at, d, type: 'sawtooth' as const, v: 0.012 },
    { f: f * 1.006, at, d, type: 'square' as const, v: 0.008 },
  ])

const ACCORDION: Tone[] = chord(0, [261.63, 329.63, 392.0], 0.5)

/** A short forró phrase for the prize card. */
const FORRO: Tone[] = [
  ...chord(0, [293.66, 369.99, 440.0], 0.22),
  ...chord(0.3, [293.66, 369.99, 440.0], 0.12),
  ...chord(0.45, [329.63, 392.0, 493.88], 0.22),
  ...chord(0.75, [261.63, 329.63, 392.0], 0.5),
]

export function playAccordion(): () => void {
  return playSeasonTones(ACCORDION)
}

export function playForro(): () => void {
  return playSeasonTones(FORRO)
}
