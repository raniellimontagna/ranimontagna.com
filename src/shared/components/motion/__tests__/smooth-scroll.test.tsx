import { renderHook } from '@testing-library/react'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, waitFor } from '@/tests/test-utils'
import { REDUCED_MOTION_QUERY } from '../load-scroll-motion'
import { SmoothScroll, useScrollVelocity } from '../smooth-scroll'

const lenisInstance = { on: vi.fn(), raf: vi.fn(), destroy: vi.fn() }
const LenisMock = vi.fn(function Lenis() {
  return lenisInstance
})

const gsapMock = {
  registerPlugin: vi.fn(),
  ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
}
const ScrollTriggerMock = { update: vi.fn() }

vi.mock('lenis', () => ({ default: LenisMock }))
vi.mock('gsap', () => ({ gsap: gsapMock, default: gsapMock }))
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: ScrollTriggerMock,
  default: ScrollTriggerMock,
}))

describe('SmoothScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not create Lenis when the user prefers reduced motion', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(
      <SmoothScroll>
        <p>x</p>
      </SmoothScroll>,
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(LenisMock).not.toHaveBeenCalled()
  })

  it('creates Lenis, feeds ScrollTrigger and destroys it on unmount', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    const { unmount } = render(
      <SmoothScroll>
        <p>x</p>
      </SmoothScroll>,
    )
    await waitFor(() =>
      expect(LenisMock).toHaveBeenCalledWith(expect.objectContaining({ lerp: 0.09 })),
    )
    expect(lenisInstance.on).toHaveBeenCalledWith('scroll', ScrollTriggerMock.update)
    expect(gsapMock.ticker.add).toHaveBeenCalled()
    unmount()
    expect(lenisInstance.destroy).toHaveBeenCalled()
    expect(gsapMock.ticker.remove).toHaveBeenCalled()
  })

  it('useScrollVelocity is 0 outside the provider', () => {
    const { result } = renderHook(() => useScrollVelocity())
    expect(result.current.current).toBe(0)
  })
})
