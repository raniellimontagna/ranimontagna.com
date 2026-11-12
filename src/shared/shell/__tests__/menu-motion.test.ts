import { closeMenuMotion, type MenuMotionEls, openMenuMotion, recedeOrigin } from '../menu-motion'

type Recorded = { el: Element; keyframes: Keyframe[]; options: KeyframeAnimationOptions }

function fakeEls(): { els: MenuMotionEls; calls: Recorded[] } {
  const calls: Recorded[] = []
  const make = () => {
    const el = document.createElement('div')
    el.animate = ((keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      calls.push({ el, keyframes, options })
      return { finished: Promise.resolve() } as unknown as Animation
    }) as typeof el.animate
    return el
  }
  const page = make()
  return {
    els: {
      page,
      pageOrigin: '50% 5400px',
      bg: make(),
      links: [make()],
      numbers: [],
      socials: [make()],
      chrome: [],
    },
    calls,
  }
}

describe('menu motion', () => {
  it('measures the recede origin at the viewport centre, in page coordinates', () => {
    const page = document.createElement('main')
    page.getBoundingClientRect = () => ({ top: -5000 }) as DOMRect
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    expect(recedeOrigin(page)).toBe('50% 5400px')
  })

  it('recedes the page around the viewport centre by 2% of the viewport, not of the page', () => {
    const { els, calls } = fakeEls()
    openMenuMotion(els, { x: 300, y: 30 }, false)
    closeMenuMotion(els, { x: 300, y: 30 }, false)
    const pageFrames = calls
      .filter((call) => call.el === els.page)
      .flatMap((call) => call.keyframes)
    expect(pageFrames.length).toBeGreaterThan(0)
    for (const frame of pageFrames) expect(frame.transformOrigin).toBe('50% 5400px')
    const receded = pageFrames.find((frame) => String(frame.transform).includes('scale'))
    expect(String(receded?.transform)).toContain('translateY(-2vh)')
    expect(String(receded?.transform)).not.toMatch(/translateY\(-?\d+%\)/)
  })

  it('fades in and out in 150 ms with reduced motion', () => {
    const { els, calls } = fakeEls()
    openMenuMotion(els, { x: 0, y: 0 }, true)
    closeMenuMotion(els, { x: 0, y: 0 }, true)
    expect(calls.length).toBeGreaterThan(0)
    for (const call of calls) expect(call.options.duration).toBe(150)
  })
})
