import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { captureIntersection, installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { CodePortrait } from '../code-portrait'
import { CODE_GLYPHS } from '../glyph-grid'

const ALT = 'Ranielli Montagna'

function renderPortrait() {
  render(<CodePortrait src="/photo.webp" alt={ALT} getReveal={() => 0} />)
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
})
