const gsapMock = { registerPlugin: vi.fn() }
const ScrollTriggerMock = { name: 'ScrollTrigger' }

vi.mock('gsap', () => ({ gsap: gsapMock, default: gsapMock }))
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: ScrollTriggerMock,
  default: ScrollTriggerMock,
}))

// The loader caches its import at module level: every test gets a fresh copy.
async function freshLoader() {
  vi.resetModules()
  const { loadScrollMotion } = await import('../load-scroll-motion')
  return loadScrollMotion
}

describe('loadScrollMotion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers ScrollTrigger once and hands every caller the same pair', async () => {
    const loadScrollMotion = await freshLoader()

    const [first, second] = await Promise.all([loadScrollMotion(), loadScrollMotion()])

    expect(first).toEqual({ gsap: gsapMock, ScrollTrigger: ScrollTriggerMock })
    expect(second).toEqual(first)
    expect(gsapMock.registerPlugin).toHaveBeenCalledTimes(1)
    expect(gsapMock.registerPlugin).toHaveBeenCalledWith(ScrollTriggerMock)
  })

  it('resumes each caller in a task of its own, in call order', async () => {
    const loadScrollMotion = await freshLoader()
    const log: string[] = []

    const callers = ['hero', 'reveal', 'cycle'].map((name) =>
      loadScrollMotion().then(() => {
        log.push(name)
        // Runs before the next caller only if that caller resumes in a later task.
        queueMicrotask(() => log.push(`${name} done`))
      }),
    )
    await Promise.all(callers)

    expect(log).toEqual(['hero', 'hero done', 'reveal', 'reveal done', 'cycle', 'cycle done'])
  })
})
