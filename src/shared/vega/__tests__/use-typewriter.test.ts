import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { act, renderHook } from '@/tests/test-utils'
import { useTypewriter } from '../use-typewriter'

describe('useTypewriter', () => {
  afterEach(() => vi.useRealTimers())

  it('types the answer word by word', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    vi.useFakeTimers()
    const { result } = renderHook(() => useTypewriter('O Grimory é o melhor exemplo.', true, 25))
    expect(result.current).toBe('')
    act(() => vi.advanceTimersByTime(50))
    expect(result.current.length).toBeGreaterThan(0)
    expect(result.current).not.toBe('O Grimory é o melhor exemplo.')
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current).toBe('O Grimory é o melhor exemplo.')
  })

  it('shows everything at once without motion', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const { result } = renderHook(() => useTypewriter('Tudo de uma vez.', true))
    expect(result.current).toBe('Tudo de uma vez.')
  })

  it('shows everything at once when not animating', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    const { result } = renderHook(() => useTypewriter('Já lida.', false))
    expect(result.current).toBe('Já lida.')
  })
})
