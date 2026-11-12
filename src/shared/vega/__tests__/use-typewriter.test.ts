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
    expect(result.current.text).toBe('')
    expect(result.current.done).toBe(false)
    act(() => vi.advanceTimersByTime(50))
    expect(result.current.text.length).toBeGreaterThan(0)
    expect(result.current.text).not.toBe('O Grimory é o melhor exemplo.')
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current).toEqual({ text: 'O Grimory é o melhor exemplo.', done: true })
  })

  it('shows everything at once without motion', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const { result } = renderHook(() => useTypewriter('Tudo de uma vez.', true))
    expect(result.current).toEqual({ text: 'Tudo de uma vez.', done: true })
  })

  it('shows everything at once when not animating', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    const { result } = renderHook(() => useTypewriter('Já lida.', false))
    expect(result.current).toEqual({ text: 'Já lida.', done: true })
  })

  it('restarts from zero the moment animation turns on, without a done frame', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ on }) => useTypewriter('Uma resposta curta.', on), {
      initialProps: { on: false },
    })
    expect(result.current.done).toBe(true)
    rerender({ on: true })
    expect(result.current).toEqual({ text: '', done: false })
  })
})
