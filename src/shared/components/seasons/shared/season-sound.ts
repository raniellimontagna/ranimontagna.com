import { playToneSequence, type Tone } from '@/shared/components/retro-mode/worlds/world-sound'

export type { Tone }

/** localStorage: 'on' plays the season's sounds. Off by default, apart from the retro switch. */
const SEASON_SOUND_KEY = 'season-sound'

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

/** Plays the tones only while the season sound is on; returns a function that silences them. */
export function playSeasonTones(tones: readonly Tone[]): () => void {
  return isSeasonSoundOn() ? playToneSequence(tones) : () => {}
}
