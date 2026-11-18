import { setSoundOn } from '@/shared/components/retro-mode/worlds/world-sound'
import { installFakeAudio } from '@/tests/mocks/audio'
import { blockStorage } from '@/tests/mocks/storage'
import {
  isSeasonSoundOn,
  onSeasonSoundChange,
  playSeasonTones,
  setSeasonSound,
} from '../season-sound'

const TONES = [{ f: 440, at: 0, d: 0.2 }]
let audio: ReturnType<typeof installFakeAudio>

beforeEach(() => {
  audio = installFakeAudio()
})

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.restoreAllMocks()
})

it('is off by default, whatever the retro worlds say', () => {
  expect(isSeasonSoundOn()).toBe(false)
  setSoundOn(true)
  expect(isSeasonSoundOn()).toBe(false)
})

it('stays silent while off', () => {
  playSeasonTones(TONES)
  expect(audio.oscillators).not.toHaveBeenCalled()
})

it('plays once turned on, and tells who listens', () => {
  const listener = vi.fn()
  const unsubscribe = onSeasonSoundChange(listener)
  setSeasonSound(true)
  expect(isSeasonSoundOn()).toBe(true)
  expect(listener).toHaveBeenCalledWith(true)
  expect(localStorage.getItem('season-sound')).toBe('on')

  const stop = playSeasonTones(TONES)
  expect(audio.oscillators).toHaveBeenCalledTimes(1)
  expect(() => stop()).not.toThrow()

  setSeasonSound(false)
  expect(localStorage.getItem('season-sound')).toBeNull()
  unsubscribe()
})

it('keeps quiet when storage is blocked', () => {
  localStorage.setItem('season-sound', 'on')
  blockStorage()
  expect(isSeasonSoundOn()).toBe(false)
  expect(() => setSeasonSound(true)).not.toThrow()
})
