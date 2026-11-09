import { act, render } from '@testing-library/react'
import { BELOW_LG_QUERY, REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { CaseTourScroller } from '../case-tour-scroller'

type Observer = {
  callback: IntersectionObserverCallback
  options?: IntersectionObserverInit
  targets: Element[]
}

let observers: Observer[] = []

class RecordingObserver {
  private record: Observer
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.record = { callback, options, targets: [] }
    observers.push(this.record)
  }
  observe = (target: Element) => this.record.targets.push(target)
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = () => []
}

const play = vi.fn(function (this: HTMLVideoElement) {
  return Promise.resolve()
})
const pause = vi.fn()

beforeEach(() => {
  observers = []
  window.IntersectionObserver = RecordingObserver as unknown as typeof IntersectionObserver
  play.mockClear()
  pause.mockClear()
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: play })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: pause })
})

function Tour() {
  return (
    <CaseTourScroller total={3}>
      <div data-tour-stage>
        {[0, 1, 2].map((step) => (
          <div key={step} data-tour-screen data-step={step} data-active={step === 0}>
            {step === 1 ? <video data-testid="loop" muted /> : null}
          </div>
        ))}
        <p data-tour-count>01 / 03</p>
      </div>
      <ol>
        {[0, 1, 2].map((step) => (
          <li key={step} data-tour-step data-step={step} data-active={step === 0} />
        ))}
      </ol>
    </CaseTourScroller>
  )
}

const stepsObserver = () =>
  observers.find((item) => item.targets.some((t) => t.matches('[data-tour-step]')))
const stageObserver = () =>
  observers.find((item) => item.targets.some((t) => t.matches('[data-tour-stage]')))
const enter = (observer: Observer | undefined, target: Element, isIntersecting = true) =>
  act(() =>
    observer?.callback(
      [{ target, isIntersecting } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  )

describe('CaseTourScroller', () => {
  it('activates the step that crosses the band, with its screens and the counter', () => {
    mockMatchMedia({})
    const { container } = render(<Tour />)
    const second = container.querySelectorAll('[data-tour-step]')[1] as Element
    enter(stepsObserver(), second)
    for (const element of container.querySelectorAll('[data-step]')) {
      expect(element.getAttribute('data-active')).toBe(
        String(element.getAttribute('data-step') === '1'),
      )
    }
    expect(container.querySelector('[data-tour-count]')?.textContent).toBe('02 / 03')
  })

  it('plays only the active step’s loop, and only while the stage is on screen', () => {
    mockMatchMedia({})
    const { container, getByTestId } = render(<Tour />)
    const loop = getByTestId('loop')
    const stage = container.querySelector('[data-tour-stage]') as Element
    enter(stepsObserver(), container.querySelectorAll('[data-tour-step]')[1] as Element)
    expect(play).not.toHaveBeenCalled()
    enter(stageObserver(), stage)
    expect(play.mock.contexts).toContain(loop)
    enter(stageObserver(), stage, false)
    expect(pause.mock.contexts).toContain(loop)
    play.mockClear()
    enter(stageObserver(), stage)
    enter(stepsObserver(), container.querySelectorAll('[data-tour-step]')[2] as Element)
    expect(pause.mock.contexts).toContain(loop)
  })

  it('keeps every loop on its poster with reduced motion, and still swaps the screens', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const { container } = render(<Tour />)
    enter(stageObserver(), container.querySelector('[data-tour-stage]') as Element)
    enter(stepsObserver(), container.querySelectorAll('[data-tour-step]')[1] as Element)
    expect(play).not.toHaveBeenCalled()
    expect(container.querySelectorAll('[data-tour-screen]')[1]?.getAttribute('data-active')).toBe(
      'true',
    )
  })

  it('reads the step lower on the screen on phones, under the pinned phone', () => {
    mockMatchMedia({ [BELOW_LG_QUERY]: false })
    const desktop = render(<Tour />)
    const desktopMargin = stepsObserver()?.options?.rootMargin
    desktop.unmount()
    observers = []
    mockMatchMedia({ [BELOW_LG_QUERY]: true })
    render(<Tour />)
    expect(stepsObserver()?.options?.rootMargin).not.toBe(desktopMargin)
  })
})
