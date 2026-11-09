import { act, render } from '@testing-library/react'
import { LG_QUERY, REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { captureIntersection } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { CaseVideo } from '../case-video'

const play = vi.fn(() => Promise.resolve())
const pause = vi.fn()

beforeEach(() => {
  play.mockClear()
  pause.mockClear()
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: play })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: pause })
})

const video = (container: HTMLElement) => container.querySelector('video') as HTMLVideoElement

describe('CaseVideo', () => {
  it('is a muted, looping, inline loop that downloads nothing until it plays', () => {
    mockMatchMedia({})
    const { container } = render(<CaseVideo src="/a.mp4" />)
    const element = video(container)
    expect(element.muted).toBe(true)
    expect(element).toHaveAttribute('loop')
    expect(element).toHaveAttribute('playsinline')
    expect(element).toHaveAttribute('preload', 'none')
  })

  it('lies over the still as decoration, invisible until it plays', () => {
    mockMatchMedia({})
    const { container } = render(<CaseVideo src="/a.mp4" />)
    const element = video(container)
    // The still underneath (an optimized <img>) carries the alt and is the LCP.
    expect(element).toHaveAttribute('aria-hidden', 'true')
    expect(element).not.toHaveAttribute('poster')
    expect(element).not.toHaveAttribute('data-started')
    act(() => {
      element.dispatchEvent(new Event('playing'))
    })
    expect(element).toHaveAttribute('data-started', 'true')
  })

  it('plays while it is on screen and pauses when it leaves', () => {
    mockMatchMedia({})
    const io = captureIntersection()
    render(<CaseVideo src="/a.mp4" />)
    act(() => io.setVisible(true))
    expect(play).toHaveBeenCalledTimes(1)
    act(() => io.setVisible(false))
    expect(pause).toHaveBeenCalled()
  })

  it('never plays with reduced motion: the poster stays', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const io = captureIntersection()
    render(<CaseVideo src="/a.mp4" />)
    act(() => io.setVisible(true))
    expect(play).not.toHaveBeenCalled()
  })

  it('keeps a desktop-only loop on its poster below lg', () => {
    mockMatchMedia({ [LG_QUERY]: false })
    const io = captureIntersection()
    render(<CaseVideo src="/a.mp4" query={LG_QUERY} />)
    act(() => io.setVisible(true))
    expect(play).not.toHaveBeenCalled()
  })

  it('leaves a managed loop to whoever manages it', () => {
    mockMatchMedia({})
    const io = captureIntersection()
    render(<CaseVideo src="/a.mp4" managed />)
    act(() => io.setVisible(true))
    expect(play).not.toHaveBeenCalled()
  })
})
