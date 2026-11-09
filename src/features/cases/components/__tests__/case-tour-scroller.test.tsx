import { act, render } from '@testing-library/react'
import { BELOW_LG_QUERY, REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { CaseTourScroller } from '../case-tour-scroller'

type Observer = { callback: IntersectionObserverCallback; targets: Element[] }
let observers: Observer[] = []

class RecordingObserver {
  private record: Observer
  constructor(callback: IntersectionObserverCallback) {
    this.record = { callback, targets: [] }
    observers.push(this.record)
  }
  observe = (target: Element) => this.record.targets.push(target)
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = () => []
}

const play = vi.fn(() => Promise.resolve())
const pause = vi.fn()

beforeEach(() => {
  observers = []
  window.IntersectionObserver = RecordingObserver as unknown as typeof IntersectionObserver
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 })
  play.mockClear()
  pause.mockClear()
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: play })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: pause })
  // jsdom has no layout: a real browser reports a rendered element as visible.
  Object.defineProperty(HTMLElement.prototype, 'checkVisibility', {
    configurable: true,
    value: () => true,
  })
})

function Tour() {
  return (
    <CaseTourScroller total={3}>
      <div data-tour-stage>
        {[0, 1, 2].map((step) => (
          <div
            key={step}
            data-tour-screen
            data-step={step}
            data-active={step === 0}
            aria-hidden={step !== 0}
          >
            {step === 1 ? <video data-testid="loop" muted /> : null}
          </div>
        ))}
        <p data-tour-count>01 / 03</p>
      </div>
      <ol>
        {[0, 1, 2].map((step) => (
          <li key={step} data-tour-step data-step={step} data-active={step === 0}>
            <h3 data-tour-caption>step {step}</h3>
          </li>
        ))}
      </ol>
    </CaseTourScroller>
  )
}

const at = (element: Element | null | undefined, rect: Partial<DOMRect>) => {
  if (element) element.getBoundingClientRect = () => ({ top: 0, bottom: 0, ...rect }) as DOMRect
}

/** Lays the steps out with their tops (captions 30 px lower) at these positions, then scrolls. */
async function scrollTo(container: HTMLElement, tops: number[], stageBottom = 0) {
  at(container.querySelector('[data-tour-stage]'), { bottom: stageBottom })
  container.querySelectorAll('[data-tour-step]').forEach((step, i) => {
    at(step, { top: tops[i] })
    at(step.querySelector('[data-tour-caption]'), { top: (tops[i] ?? 0) + 30 })
  })
  await act(async () => {
    window.dispatchEvent(new Event('scroll'))
    await new Promise((resolve) => requestAnimationFrame(resolve))
  })
}

const activeSteps = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-tour-step]')).map((s) =>
    s.getAttribute('data-active'),
  )

const stageObserver = () =>
  observers.find((o) => o.targets.some((t) => t.matches('[data-tour-stage]')))
const stageVisible = (container: HTMLElement, isIntersecting: boolean) =>
  act(() =>
    stageObserver()?.callback(
      [
        {
          target: container.querySelector('[data-tour-stage]'),
          isIntersecting,
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    ),
  )

describe('CaseTourScroller', () => {
  it('on desktop activates the last step whose top passed the middle, with its screens and the counter', async () => {
    mockMatchMedia({ [BELOW_LG_QUERY]: false })
    const { container } = render(<Tour />)
    await scrollTo(container, [-600, 300, 1200])
    for (const element of container.querySelectorAll('[data-step]')) {
      expect(element.getAttribute('data-active')).toBe(
        String(element.getAttribute('data-step') === '1'),
      )
    }
    expect(container.querySelector('[data-tour-count]')?.textContent).toBe('02 / 03')
  })

  it('hides the inactive screens from assistive tech', async () => {
    mockMatchMedia({ [BELOW_LG_QUERY]: false })
    const { container } = render(<Tour />)
    await scrollTo(container, [-600, 300, 1200])
    const hidden = Array.from(container.querySelectorAll('[data-tour-screen]')).map((s) =>
      s.getAttribute('aria-hidden'),
    )
    expect(hidden).toEqual(['true', 'false', 'true'])
  })

  it('lands on the right step when the tour is entered from below', async () => {
    mockMatchMedia({ [BELOW_LG_QUERY]: false })
    const { container } = render(<Tour />)
    await scrollTo(container, [-2400, -1500, -300])
    expect(activeSteps(container)).toEqual(['false', 'false', 'true'])
  })

  it('on phones follows the caption showing below the pinned phone, in both directions', async () => {
    mockMatchMedia({ [BELOW_LG_QUERY]: true })
    const { container } = render(<Tour />)
    // Scrolling down: step 2's caption comes up under the phone (which ends at 650).
    await scrollTo(container, [-400, 820, 1500], 650)
    expect(activeSteps(container)).toEqual(['false', 'true', 'false'])
    // Scrolling back up: step 2's caption is still showing, step 1's still under the phone.
    await scrollTo(container, [60, 860, 1560], 650)
    expect(activeSteps(container)).toEqual(['false', 'true', 'false'])
    // Step 2's caption has left at the bottom and step 1's comes out from under the phone.
    await scrollTo(container, [640, 1640, 2340], 650)
    expect(activeSteps(container)).toEqual(['true', 'false', 'false'])
  })

  it('plays only the active step’s loop, and only while the stage is on screen', async () => {
    mockMatchMedia({ [BELOW_LG_QUERY]: false })
    const { container, getByTestId } = render(<Tour />)
    const loop = getByTestId('loop')
    await scrollTo(container, [-600, 300, 1200])
    expect(play).not.toHaveBeenCalled()
    stageVisible(container, true)
    expect(play.mock.contexts).toContain(loop)
    stageVisible(container, false)
    expect(pause.mock.contexts).toContain(loop)
    stageVisible(container, true)
    pause.mockClear()
    await scrollTo(container, [-1500, -600, 300])
    expect(pause.mock.contexts).toContain(loop)
  })

  it('keeps every loop on its still with reduced motion, and still swaps the screens', async () => {
    mockMatchMedia({ [BELOW_LG_QUERY]: false, [REDUCED_MOTION_QUERY]: true })
    const { container } = render(<Tour />)
    stageVisible(container, true)
    await scrollTo(container, [-600, 300, 1200])
    expect(play).not.toHaveBeenCalled()
    expect(container.querySelectorAll('[data-tour-screen]')[1]?.getAttribute('data-active')).toBe(
      'true',
    )
  })

  it('without checkVisibility (iOS before 17.4) a loop in a frame that is not rendered stays still', async () => {
    mockMatchMedia({ [BELOW_LG_QUERY]: false })
    Object.defineProperty(HTMLElement.prototype, 'checkVisibility', {
      configurable: true,
      value: undefined,
    })
    const { container } = render(<Tour />)
    stageVisible(container, true)
    await scrollTo(container, [-600, 300, 1200])
    // jsdom renders nothing, like display: none: no client rects.
    expect(play).not.toHaveBeenCalled()
  })
})
