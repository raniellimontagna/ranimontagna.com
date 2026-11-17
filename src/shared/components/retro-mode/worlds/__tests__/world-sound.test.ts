import {
  isSoundOn,
  NOTE,
  onSoundChange,
  playToneSequence,
  playTones,
  setSoundOn,
} from '../world-sound'

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

const created: FakeNode[] = []
const resume = vi.fn(() => Promise.resolve())

class FakeAudioContext {
  currentTime = 1
  state = 'suspended'
  destination = {}
  resume = resume
  createOscillator() {
    const node = new FakeNode()
    created.push(node)
    return node
  }
  createGain() {
    return new FakeNode()
  }
}

afterEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})

it('stays silent without Web Audio', () => {
  expect('AudioContext' in window).toBe(false)
  const stop = playTones([{ f: NOTE.A4, at: 0, d: 0.1 }])
  expect(() => stop()).not.toThrow()
})

it('plays every tone with an envelope and stops what is still ringing', () => {
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext })
  const stop = playTones([
    { f: NOTE.C5, at: 0, d: 0.2 },
    { f: NOTE.G5, at: 0.1, d: 0.3, type: 'square', v: 0.02 },
  ])
  expect(created).toHaveLength(2)
  expect(resume).toHaveBeenCalled()
  expect(created[1].type).toBe('square')
  expect(created[0].frequency.setValueAtTime).toHaveBeenCalledWith(NOTE.C5, expect.any(Number))
  expect(created[0].start).toHaveBeenCalled()

  created[0].stop.mockImplementationOnce(() => {
    throw new Error('already stopped')
  })
  stop()
  expect(created[1].stop).toHaveBeenCalledTimes(2)
})

it('shares one sound switch for the session and tells every world', () => {
  const listener = vi.fn()
  const unsubscribe = onSoundChange(listener)
  expect(isSoundOn()).toBe(true)
  setSoundOn(false)
  expect(isSoundOn()).toBe(false)
  expect(listener).toHaveBeenCalledWith(false)

  const before = created.length
  playTones([{ f: NOTE.E5, at: 0, d: 0.1 }])
  expect(created).toHaveLength(before)

  unsubscribe()
  setSoundOn(true)
  expect(listener).toHaveBeenCalledTimes(1)
})

it('keeps working when storage is blocked', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  const listener = vi.fn()
  onSoundChange(listener)
  expect(isSoundOn()).toBe(true)
  setSoundOn(false)
  expect(listener).toHaveBeenCalledWith(false)
})

it('plays a raw sequence for callers with their own switch, even with retro sound off', () => {
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext })
  setSoundOn(false)
  const before = created.length
  playToneSequence([{ f: NOTE.E6, at: 0, d: 0.1 }])
  expect(created).toHaveLength(before + 1)
  playTones([{ f: NOTE.E6, at: 0, d: 0.1 }])
  expect(created).toHaveLength(before + 1)
})
