import { preload } from 'react-dom'
import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { captureIntersection, installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { CodePortrait } from '../code-portrait'
import { CODE_GLYPHS } from '../glyph-grid'
import { PORTRAIT_IMAGE } from '../portrait-image'

vi.mock('react-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-dom')>()),
  preload: vi.fn(),
}))

const ALT = 'Ranielli Montagna'

function renderPortrait() {
  render(<CodePortrait image={PORTRAIT_IMAGE} alt={ALT} getReveal={() => 0} />)
  return screen.getByAltText(ALT) as HTMLImageElement
}

function loadPhoto(img: HTMLImageElement) {
  Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 3054 })
  Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 4096 })
  fireEvent.load(img)
}

function charsDrawnAt(ctx: ReturnType<typeof mockCanvas2d>['ctx'], x: number, y: number) {
  return ctx.fillText.mock.calls.filter(([, px, py]) => px === x && py === y).map(([ch]) => ch)
}

describe('CodePortrait', () => {
  let canvas: ReturnType<typeof mockCanvas2d>
  let frames: ReturnType<typeof installFrameStub>
  let intersection: ReturnType<typeof captureIntersection>

  beforeEach(() => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    canvas = mockCanvas2d()
    frames = installFrameStub()
    intersection = captureIntersection()
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the real photo with alt as the accessible element', () => {
    renderPortrait()
    expect(screen.getByAltText(ALT)).toBeInTheDocument()
    expect(document.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  it('keeps the photo and never draws under reduced motion', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const img = renderPortrait()
    loadPhoto(img)
    act(() => frames.flush(3))
    expect(canvas.ctx.fillText).not.toHaveBeenCalled()
    expect(img.style.opacity).not.toBe('0')
  })

  it('stops drawing while off-screen', () => {
    const img = renderPortrait()
    loadPhoto(img)
    act(() => frames.flush(1))
    expect(canvas.ctx.fillText).toHaveBeenCalled()
    act(() => intersection.setVisible(false))
    canvas.ctx.fillText.mockClear()
    act(() => frames.flush(3))
    expect(canvas.ctx.fillText).not.toHaveBeenCalled()
  })

  it('turns cells near a touch point into code glyphs', () => {
    const img = renderPortrait()
    loadPhoto(img)
    act(() => frames.flush(1))
    expect(charsDrawnAt(canvas.ctx, 0, 0)).toEqual(['@'])
    canvas.ctx.fillText.mockClear()
    fireEvent.touchMove(screen.getByTestId('code-portrait'), {
      touches: [{ clientX: 0, clientY: 0 }],
    })
    act(() => frames.flush(1))
    const [ch] = charsDrawnAt(canvas.ctx, 0, 0)
    expect(CODE_GLYPHS).toContain(ch)
  })

  it('rebuilds the grid on resize', () => {
    const img = renderPortrait()
    loadPhoto(img)
    expect(canvas.ctx.getImageData).toHaveBeenLastCalledWith(0, 0, 50, expect.any(Number))
    canvas.setSize(200, 500)
    fireEvent(window, new Event('resize'))
    expect(canvas.ctx.getImageData).toHaveBeenLastCalledWith(0, 0, 25, expect.any(Number))
  })

  it('does not throw and keeps the img when the photo fails', () => {
    const img = renderPortrait()
    fireEvent.error(img)
    expect(() => act(() => frames.flush(3))).not.toThrow()
    expect(canvas.ctx.getImageData).not.toHaveBeenCalled()
    expect(screen.getByAltText(ALT)).toBeInTheDocument()
  })
  it('draws the whole photo into a destination rect, never a source crop (srcset density)', () => {
    const img = renderPortrait()
    loadPhoto(img)
    const [call] = canvas.ctx.drawImage.mock.calls
    expect(call).toHaveLength(5)
    expect(call[0]).toBe(img)
  })
  it('keeps the grid when a resize does not change its size (phone URL bar)', () => {
    const img = renderPortrait()
    loadPhoto(img)
    expect(canvas.ctx.getImageData).toHaveBeenCalledTimes(1)
    fireEvent(window, new Event('resize'))
    expect(canvas.ctx.getImageData).toHaveBeenCalledTimes(1)
  })

  it('runs no frame loop before the photo loads', () => {
    renderPortrait()
    act(() => intersection.setVisible(true))
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('preloads the photo it samples, at high priority, with the same sources', () => {
    renderPortrait()
    expect(preload).toHaveBeenCalledWith(
      PORTRAIT_IMAGE.src,
      expect.objectContaining({
        as: 'image',
        imageSrcSet: PORTRAIT_IMAGE.srcSet,
        imageSizes: PORTRAIT_IMAGE.sizes,
        fetchPriority: 'high',
      }),
    )
  })

  it('serves the portrait as static pre-sized files the CDN can cache, not through /_next/image', () => {
    const img = renderPortrait()
    expect(img.getAttribute('srcset')).toBe(PORTRAIT_IMAGE.srcSet)
    expect(img.getAttribute('srcset')).not.toContain('/_next/image')
    expect(img.getAttribute('fetchpriority')).toBe('high')
  })

  it('re-reads theme colors when the theme changes, not when Lenis toggles classes', async () => {
    const img = renderPortrait()
    loadPhoto(img)
    act(() => frames.flush(1))
    const spy = vi.spyOn(window, 'getComputedStyle')

    document.documentElement.classList.add('lenis-scrolling')
    await Promise.resolve()
    act(() => frames.flush(1))
    expect(spy).not.toHaveBeenCalledWith(document.documentElement)

    document.documentElement.classList.add('light')
    await Promise.resolve()
    act(() => frames.flush(1))
    expect(spy).toHaveBeenCalledWith(document.documentElement)
    document.documentElement.classList.remove('lenis-scrolling', 'light')
  })

  describe('with the photo already loaded at mount', () => {
    beforeEach(() => {
      vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
      vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(3054)
      vi.spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get').mockReturnValue(4096)
    })

    it('builds the grid in a later task, not during the mount', async () => {
      renderPortrait()
      expect(canvas.ctx.getImageData).not.toHaveBeenCalled()

      await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
      expect(canvas.ctx.getImageData).toHaveBeenCalledTimes(1)
      act(() => frames.flush(1))
      expect(canvas.ctx.fillText).toHaveBeenCalled()
    })

    it('skips that build when it unmounts first', async () => {
      const { unmount } = render(
        <CodePortrait image={PORTRAIT_IMAGE} alt={ALT} getReveal={() => 0} />,
      )
      unmount()

      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(canvas.ctx.getImageData).not.toHaveBeenCalled()
      expect(window.requestAnimationFrame).not.toHaveBeenCalled()
    })
  })
})
