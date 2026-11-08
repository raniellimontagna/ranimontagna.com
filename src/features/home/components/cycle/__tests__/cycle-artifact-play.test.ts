import type { ScrollMotion } from '@/shared/components/motion'
import { playArtifact, prepareArtifact, resetArtifact } from '../cycle-artifact-play'

const gsap = { set: vi.fn(), to: vi.fn() } as unknown as ScrollMotion['gsap']

const art = (html: string) => {
  const element = document.createElement('div')
  element.innerHTML = html
  return element
}

describe('cycle artifacts on phones', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('code: hides every line, then shows them one by one', () => {
    const terminal = art('<span data-terminal-line>a</span>'.repeat(5))
    const lines = terminal.querySelectorAll<HTMLElement>('[data-terminal-line]')
    prepareArtifact('code', terminal, gsap)
    for (const line of lines) expect(line.hidden).toBe(true)
    playArtifact('code', terminal, gsap)
    vi.advanceTimersByTime(200 + 230 * 2)
    expect(terminal.querySelectorAll('[data-terminal-line]:not([hidden])')).toHaveLength(3)
    vi.advanceTimersByTime(230 * 2)
    expect(terminal.querySelectorAll('[data-terminal-line]:not([hidden])')).toHaveLength(5)
  })

  it('solution: empties the boxes, then checks them in order every 320 ms', () => {
    const spec = art('<span data-spec-box data-checked="true"></span>'.repeat(3))
    const boxes = spec.querySelectorAll<HTMLElement>('[data-spec-box]')
    prepareArtifact('solution', spec, gsap)
    for (const box of boxes) expect(box.dataset.checked).toBe('false')
    playArtifact('solution', spec, gsap)
    vi.advanceTimersByTime(300)
    expect(boxes[0].dataset.checked).toBe('true')
    expect(boxes[1].dataset.checked).toBe('false')
    vi.advanceTimersByTime(320)
    expect(boxes[1].dataset.checked).toBe('true')
  })

  it('pain: plays the messages with 0, 0.35 and 0.9 s delays', () => {
    const thread = art('<p data-reveal>a</p><p data-reveal>b</p><p data-reveal>c</p>')
    const messages = thread.querySelectorAll('p[data-reveal]')
    prepareArtifact('pain', thread, gsap)
    expect(gsap.set).toHaveBeenCalledWith(messages, { y: 10, opacity: 0 })
    playArtifact('pain', thread, gsap)
    const delays = vi
      .mocked(gsap.to)
      .mock.calls.map(([, vars]) => (vars as { delay: number }).delay)
    expect(delays).toEqual([0, 0.35, 0.9])
  })

  it('product: the screen settles from 0.94, the phone rises from 40 px and -4 degrees', () => {
    const product = art('<div data-reveal></div><div data-reveal></div>')
    const [screen, phone] = product.querySelectorAll('[data-reveal]')
    prepareArtifact('product', product, gsap)
    expect(gsap.set).toHaveBeenCalledWith(screen, { scale: 0.94, opacity: 0 })
    expect(gsap.set).toHaveBeenCalledWith(phone, { y: 40, rotation: -4, opacity: 0 })
    playArtifact('product', product, gsap)
    expect(gsap.to).toHaveBeenCalledWith(phone, expect.objectContaining({ delay: 0.15, y: 0 }))
  })

  it('reset shows everything again and cancels steps still pending', () => {
    const terminal = art('<span data-terminal-line>a</span>'.repeat(3))
    prepareArtifact('code', terminal, gsap)
    playArtifact('code', terminal, gsap)
    resetArtifact('code', terminal, gsap)
    expect(terminal.querySelectorAll('[data-terminal-line]:not([hidden])')).toHaveLength(3)
    // Prepared again (back below lg): stale steps from the first play must not show lines.
    prepareArtifact('code', terminal, gsap)
    vi.advanceTimersByTime(5000)
    expect(terminal.querySelectorAll('[data-terminal-line]:not([hidden])')).toHaveLength(0)
  })
})
