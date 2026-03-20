import { renderHook } from '@/tests/test-utils'
import { useScrollProgress } from '../use-scroll-progress'

const mockUseScroll = vi.fn()
const mockUseTransform = vi.fn()
const mockScrollYProgress = { current: 'progress' }

vi.mock('motion/react', () => ({
  useScroll: (options: unknown) => mockUseScroll(options),
  useTransform: (value: unknown, input: number[], output: number[]) =>
    mockUseTransform(value, input, output),
}))

describe('useScrollProgress', () => {
  beforeEach(() => {
    mockUseScroll.mockReset()
    mockUseTransform.mockReset()
    mockUseScroll.mockReturnValue({ scrollYProgress: mockScrollYProgress })
    mockUseTransform.mockImplementation((value, input, output) => ({ value, input, output }))
  })

  it('binds motion scroll tracking to the returned ref with the expected offsets', () => {
    const { result } = renderHook(() => useScrollProgress())

    expect(mockUseScroll).toHaveBeenCalledWith({
      target: result.current.ref,
      offset: ['start end', 'end start'],
    })
    expect(result.current.scrollYProgress).toBe(mockScrollYProgress)
  })

  it('creates opacity, vertical offset and scale transforms from scroll progress', () => {
    const { result } = renderHook(() => useScrollProgress())

    expect(mockUseTransform).toHaveBeenNthCalledWith(
      1,
      mockScrollYProgress,
      [0, 0.2, 0.8, 1],
      [0, 1, 1, 0],
    )
    expect(mockUseTransform).toHaveBeenNthCalledWith(
      2,
      mockScrollYProgress,
      [0, 0.2, 0.8, 1],
      [60, 0, 0, -60],
    )
    expect(mockUseTransform).toHaveBeenNthCalledWith(
      3,
      mockScrollYProgress,
      [0, 0.2, 0.8, 1],
      [0.96, 1, 1, 0.96],
    )

    expect(result.current.opacity).toEqual({
      value: mockScrollYProgress,
      input: [0, 0.2, 0.8, 1],
      output: [0, 1, 1, 0],
    })
    expect(result.current.y).toEqual({
      value: mockScrollYProgress,
      input: [0, 0.2, 0.8, 1],
      output: [60, 0, 0, -60],
    })
    expect(result.current.scale).toEqual({
      value: mockScrollYProgress,
      input: [0, 0.2, 0.8, 1],
      output: [0.96, 1, 1, 0.96],
    })
  })
})
