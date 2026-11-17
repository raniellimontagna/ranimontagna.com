/**
 * Tiny synthesized sounds for the retro worlds: no audio files, nothing to
 * download. Every world shares one on/off switch, kept for the session.
 * Browsers only allow audio after a user gesture; entering a world is one.
 */

const STORAGE_KEY = 'retro-sound'

export type Tone = {
  /** Frequency in Hz. */
  f: number
  /** Start, in seconds after the call. */
  at: number
  /** Duration in seconds. */
  d: number
  type?: OscillatorType
  /** Peak gain, 0 to 1. */
  v?: number
}

let context: AudioContext | null = null
const listeners = new Set<(on: boolean) => void>()

export function isSoundOn(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundOn(on: boolean) {
  try {
    sessionStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    // Without storage the switch still works for this page view.
  }
  for (const listener of listeners) listener(on)
}

export function onSoundChange(listener: (on: boolean) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  context ??= new Ctor()
  if (context.state === 'suspended') void context.resume()
  return context
}

export function playTones(tones: readonly Tone[]) {
  if (!isSoundOn()) return
  const ctx = audio()
  if (!ctx) return
  const start = ctx.currentTime + 0.02
  for (const tone of tones) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t0 = start + tone.at
    const peak = tone.v ?? 0.08
    osc.type = tone.type ?? 'sine'
    osc.frequency.setValueAtTime(tone.f, t0)
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(0.03, tone.d / 3))
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + tone.d)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + tone.d + 0.05)
  }
}

/** Notes by name, for readable melodies. */
export const NOTE = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880,
  B5: 987.77,
  C6: 1046.5,
  E6: 1318.51,
  G6: 1567.98,
} as const
