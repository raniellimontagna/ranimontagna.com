/** A Web Audio stand-in for jsdom: counts the oscillators a sound creates. */
export function installFakeAudio() {
  const oscillators = vi.fn()

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
  class FakeAudioContext {
    currentTime = 0
    state = 'running'
    destination = {}
    resume = vi.fn()
    createOscillator() {
      oscillators()
      return new FakeNode()
    }
    createGain() {
      return new FakeNode()
    }
  }

  Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext })
  return { oscillators }
}
