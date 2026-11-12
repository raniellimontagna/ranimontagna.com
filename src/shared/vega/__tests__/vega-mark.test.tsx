import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { captureIntersection, installFrameStub } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen } from '@/tests/test-utils'
import { VegaMark } from '../vega-mark'

function mockContext() {
  const ctx = {
    clearRect: vi.fn(),
    setTransform: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    shadowBlur: 0,
    shadowColor: '',
  }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => ctx as unknown as CanvasRenderingContext2D,
  )
  return ctx
}

describe('VegaMark', () => {
  it('draws once and never loops without motion', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const ctx = mockContext()
    installFrameStub()
    render(<VegaMark size={170} />)
    expect(ctx.arc).toHaveBeenCalled()
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('only animates while visible', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    mockContext()
    const io = captureIntersection()
    const frames = installFrameStub()
    render(<VegaMark size={170} />)
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
    io.setVisible(true)
    expect(window.requestAnimationFrame).toHaveBeenCalled()
    frames.flush(2)
    io.setVisible(false)
    const calls = vi.mocked(window.requestAnimationFrame).mock.calls.length
    frames.flush(2)
    expect(vi.mocked(window.requestAnimationFrame).mock.calls.length).toBe(calls)
  })

  it('exposes its label or hides itself', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    mockContext()
    const { rerender, container } = render(<VegaMark size={56} label="Vega" />)
    expect(screen.getByRole('img', { name: 'Vega' })).toBeInTheDocument()
    rerender(<VegaMark size={56} />)
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  it('redraws with the new theme colors even without motion', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const ctx = mockContext()
    render(<VegaMark size={56} />)
    ctx.arc.mockClear()
    document.documentElement.setAttribute('data-theme', 'light')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(ctx.arc).toHaveBeenCalled()
    document.documentElement.removeAttribute('data-theme')
  })
})
