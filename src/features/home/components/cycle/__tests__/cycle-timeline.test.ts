import type { ScrollMotion } from '@/shared/components/motion'
import { TERMINAL_LINES, terminalLinesFor } from '../cycle.data'
import { buildCycleTimeline } from '../cycle-timeline'

function makeFakeMotion() {
  const timelineStub = {
    to: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    add: vi.fn(),
    call: vi.fn(),
    duration: vi.fn(() => 6),
  }
  for (const method of ['to', 'fromTo', 'set', 'add', 'call'] as const) {
    timelineStub[method].mockReturnValue(timelineStub)
  }
  const gsap = { timeline: vi.fn(() => timelineStub), set: vi.fn() }
  return { motion: { gsap, ScrollTrigger: {} } as unknown as ScrollMotion, gsap, timelineStub }
}

function makeRoot() {
  const root = document.createElement('section')
  root.innerHTML = Array.from(
    { length: 4 },
    () =>
      '<article data-scene><img data-scene-bg /><div data-scene-art><p data-reveal></p></div><div data-scene-copy></div></article>',
  ).join('')
  return root
}

describe('terminalLinesFor', () => {
  it('maps scroll progress to terminal lines', () => {
    expect(terminalLinesFor(0, 10)).toBe(0)
    expect(terminalLinesFor(0.55, 10)).toBe(6)
    expect(terminalLinesFor(2, 10)).toBe(10)
    expect(terminalLinesFor(-1, 10)).toBe(0)
  })
})

describe('buildCycleTimeline', () => {
  it('pins with a scrubbed timeline sized per breakpoint', () => {
    const { motion, gsap } = makeFakeMotion()
    const root = makeRoot()

    buildCycleTimeline(motion, root, { mobile: false, onTerminal: vi.fn() })
    expect(gsap.timeline).toHaveBeenCalledWith(
      expect.objectContaining({
        scrollTrigger: expect.objectContaining({
          trigger: root,
          pin: true,
          scrub: 0.6,
          end: '+=420%',
          refreshPriority: 2,
        }),
      }),
    )

    buildCycleTimeline(motion, root, { mobile: true, onTerminal: vi.fn() })
    expect(gsap.timeline).toHaveBeenLastCalledWith(
      expect.objectContaining({ scrollTrigger: expect.objectContaining({ end: '+=320%' }) }),
    )
  })

  it('hides every scene after the first and empties the terminal before playing', () => {
    const { motion, gsap } = makeFakeMotion()
    const root = makeRoot()
    const onTerminal = vi.fn()

    buildCycleTimeline(motion, root, { mobile: false, onTerminal })

    const scenes = Array.from(root.querySelectorAll('[data-scene]'))
    expect(gsap.set).toHaveBeenCalledWith(scenes.slice(1), { autoAlpha: 0 })
    expect(onTerminal).toHaveBeenCalledWith(0)
  })

  it('reveals each later scene with its own clip-path transition', () => {
    const { motion, timelineStub } = makeFakeMotion()
    const root = makeRoot()

    buildCycleTimeline(motion, root, { mobile: false, onTerminal: vi.fn() })

    const clipStarts = timelineStub.fromTo.mock.calls
      .map(([, from]) => (from as { clipPath?: string }).clipPath)
      .filter(Boolean)
    expect(clipStarts).toEqual([
      'inset(100% 0% 0% 0%)',
      'circle(0% at 70% 50%)',
      'inset(0% 50% 0% 50%)',
    ])
  })

  it('types the terminal from the scroll progress', () => {
    const { motion, timelineStub } = makeFakeMotion()
    const onTerminal = vi.fn()

    buildCycleTimeline(motion, makeRoot(), { mobile: false, onTerminal })

    const typing = timelineStub.to.mock.calls.find(([, vars]) => 'onUpdate' in (vars as object))
    expect(typing).toBeDefined()
    // Types while the code chapter's progress bar fills, not after it.
    expect(typing?.[2]).toBe('<')
    const [proxy, vars] = typing as [{ progress: number }, { onUpdate: () => void }]
    proxy.progress = 1
    vars.onUpdate()
    expect(onTerminal).toHaveBeenLastCalledWith(TERMINAL_LINES.length)
  })
})
