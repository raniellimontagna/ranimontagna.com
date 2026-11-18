import { playSeasonTones, type Tone } from '../shared/season-sound'

/** A short carnival whistle: two quick blasts. */
const WHISTLE: Tone[] = [
  { f: 2850, at: 0, d: 0.09, type: 'square', v: 0.02 },
  { f: 3050, at: 0.12, d: 0.16, type: 'square', v: 0.02 },
]

/** Two bars of batucada: surdo on the beats, tamborim in between. */
const SURDO = (at: number): Tone => ({ f: 70, at, d: 0.22, type: 'sine', v: 0.12 })
const TAMBORIM = (at: number): Tone => ({ f: 1900, at, d: 0.05, type: 'square', v: 0.012 })
const BATUCADA: Tone[] = [
  SURDO(0),
  SURDO(0.5),
  SURDO(1),
  SURDO(1.5),
  ...[0.25, 0.375, 0.625, 0.75, 1.125, 1.25, 1.625, 1.75].map(TAMBORIM),
]

export function playWhistle(): () => void {
  return playSeasonTones(WHISTLE)
}

export function playBatucada(): () => void {
  return playSeasonTones(BATUCADA)
}
