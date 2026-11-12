import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { installFrameStub } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { act, render } from '@/tests/test-utils'
import { StackMarquee } from '../stack-marquee'

it('measures the loop width on mount and resize, not on every frame', () => {
  mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
  const frames = installFrameStub()
  const scrollWidth = vi.fn(() => 2000)
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: scrollWidth,
  })
  render(<StackMarquee aiLabel="a" productLabel="p" />)
  act(() => frames.flush(5))
  const afterFrames = scrollWidth.mock.calls.length
  expect(afterFrames).toBeLessThanOrEqual(1)
  window.dispatchEvent(new Event('resize'))
  expect(scrollWidth.mock.calls.length).toBe(afterFrames + 1)
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollWidth')
  vi.restoreAllMocks()
})
