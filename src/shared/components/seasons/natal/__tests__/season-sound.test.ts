import { setSoundOn } from '@/shared/components/retro-mode/worlds/world-sound'
import {
  isSeasonSoundOn,
  onSeasonSoundChange,
  playBell,
  playJingle,
  setSeasonSound,
} from '../season-sound'

const constructed = vi.fn()

class FakeParam {
  setValueAtTime = vi.fn()
  exponentialRampToValueAtTime = vi.fn()
}
class FakeNode {
  frequency = new FakeParam()
  gain = new FakeParam()
  type = ''
  connect = vi.fn((node: unknown) => node)
  start = vi.fn()
  stop = vi.fn()
}
const oscillators = vi.fn()
class FakeAudioContext {
  currentTime = 0
  state = 'running'
  destination = {}
  resume = vi.fn()
  constructor() {
    constructed()
  }
  createOscillator() {
    oscillators()
    return new FakeNode()
  }
  createGain() {
    return new FakeNode()
  }
}

beforeEach(() => {
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext })
})

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  oscillators.mockClear()
  vi.restoreAllMocks()
})

it('is off by default, whatever the retro worlds say', () => {
  expect(isSeasonSoundOn()).toBe(false)
  setSoundOn(true)
  expect(isSeasonSoundOn()).toBe(false)
})

it('stays silent while off', () => {
  playBell()
  playJingle()
  expect(oscillators).not.toHaveBeenCalled()
})

it('rings once turned on, and tells who listens', () => {
  const listener = vi.fn()
  const unsubscribe = onSeasonSoundChange(listener)
  setSeasonSound(true)
  expect(isSeasonSoundOn()).toBe(true)
  expect(listener).toHaveBeenCalledWith(true)
  expect(localStorage.getItem('season-sound')).toBe('on')

  playBell()
  expect(oscillators).toHaveBeenCalled()
  const afterBell = oscillators.mock.calls.length
  const stop = playJingle()
  expect(oscillators.mock.calls.length).toBeGreaterThan(afterBell)
  expect(() => stop()).not.toThrow()

  setSeasonSound(false)
  expect(localStorage.getItem('season-sound')).toBeNull()
  unsubscribe()
})

it('keeps quiet when storage is blocked', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  expect(isSeasonSoundOn()).toBe(false)
  expect(() => setSeasonSound(true)).not.toThrow()
})
