import { openVega, VEGA_OPEN_EVENT } from '../vega-events'

describe('openVega', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'vibrate')
  })

  it('asks for Vega and gives a 10 ms tap where the phone can vibrate', () => {
    const vibrate = vi.fn()
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })
    const listener = vi.fn()
    window.addEventListener(VEGA_OPEN_EVENT, listener)
    openVega()
    window.removeEventListener(VEGA_OPEN_EVENT, listener)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(vibrate).toHaveBeenCalledWith(10)
  })

  it('works where vibration does not exist (iOS)', () => {
    expect(() => openVega()).not.toThrow()
  })
})
