import { playToneSequence, type Tone } from '@/shared/components/retro-mode/worlds/world-sound'

/** localStorage: 'on' plays the season's sounds. Off by default, apart from the retro switch. */
export const SEASON_SOUND_KEY = 'season-sound'

const listeners = new Set<(on: boolean) => void>()

export function isSeasonSoundOn(): boolean {
  try {
    return localStorage.getItem(SEASON_SOUND_KEY) === 'on'
  } catch {
    return false
  }
}

export function setSeasonSound(on: boolean): void {
  try {
    if (on) localStorage.setItem(SEASON_SOUND_KEY, 'on')
    else localStorage.removeItem(SEASON_SOUND_KEY)
  } catch {
    // Without storage the switch still works for this page view.
  }
  for (const listener of listeners) listener(on)
}

export function onSeasonSoundChange(listener: (on: boolean) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

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
  return isSeasonSoundOn() ? playToneSequence(BELL) : () => {}
}

export function playJingle(): () => void {
  return isSeasonSoundOn() ? playToneSequence(JINGLE) : () => {}
}
