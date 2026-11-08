import { BELOW_LG_QUERY, loadScrollMotion, REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, waitFor } from '@/tests/test-utils'
import { buildScrubText, ScrubText } from '../scrub-text'

type Config = {
  trigger?: Element
  start?: string
  end?: string
  onUpdate?: (self: { progress: number }) => void
}

function fakeTrigger() {
  const created: Config[] = []
  const kill = vi.fn()
  const ScrollTrigger = {
    create: vi.fn((config: Config) => {
      created.push(config)
      return { kill, progress: 0 }
    }),
  }
  return { created, kill, ScrollTrigger }
}

const create = vi.fn(() => ({ kill: vi.fn(), progress: 0 }))
vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  loadScrollMotion: vi.fn(() =>
    Promise.resolve({
      gsap: {
        matchMedia: () => ({
          add: (conditions: Record<string, string>, callback: () => void) => {
            if (Object.values(conditions).some((query) => window.matchMedia(query).matches))
              callback()
          },
          revert: vi.fn(),
        }),
      },
      ScrollTrigger: { create },
    }),
  ),
}))

function makeRoot(count: number, floor?: string) {
  const root = document.createElement('div')
  if (floor) root.style.setProperty('--dim-large', floor)
  root.innerHTML = Array.from(
    { length: count },
    (_, index) => `<span data-reveal-word>${index}</span>`,
  ).join('')
  document.body.appendChild(root)
  return root
}
const words = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>('[data-reveal-word]')]

describe('buildScrubText', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('fill: word opacity runs from the --dim-large floor to 1, in order', () => {
    const { created, ScrollTrigger } = fakeTrigger()
    const root = makeRoot(4, '0.4')
    buildScrubText(ScrollTrigger as never, root, 'fill')
    expect(created[0]).toMatchObject({ trigger: root, start: 'top 85%', end: 'top 50%' })
    created[0].onUpdate?.({ progress: 0.5 })
    expect(words(root).map((word) => word.style.opacity)).toEqual(['1', '1', '0.4', '0.4'])
  })

  it('fill: starts every word at the floor before the scroll reaches it', () => {
    const { ScrollTrigger } = fakeTrigger()
    const root = makeRoot(3, '0.5')
    buildScrubText(ScrollTrigger as never, root, 'fill')
    expect(words(root).map((word) => word.style.opacity)).toEqual(['0.5', '0.5', '0.5'])
  })

  it('rise: letters climb with the scroll, staggered', () => {
    const { created, ScrollTrigger } = fakeTrigger()
    const root = makeRoot(3)
    buildScrubText(ScrollTrigger as never, root, 'rise')
    // It closes the page: it must finish by the time its bottom can reach the screen bottom.
    expect(created[0]).toMatchObject({ trigger: root, start: 'top bottom', end: 'bottom bottom' })
    expect(words(root)[0].style.transform).toBe('translateY(100%)')
    created[0].onUpdate?.({ progress: 0.5 })
    const travel = words(root).map((word) => Number.parseFloat(word.style.transform.slice(11)))
    expect(travel[0]).toBeCloseTo(10)
    expect(travel[2]).toBeCloseTo(20)
    created[0].onUpdate?.({ progress: 1 })
    expect(words(root).every((word) => word.style.transform === 'translateY(0%)')).toBe(true)
  })

  it('cleanup kills the trigger and clears the words', () => {
    const { kill, ScrollTrigger } = fakeTrigger()
    const root = makeRoot(2, '0.4')
    const cleanup = buildScrubText(ScrollTrigger as never, root, 'fill')
    cleanup()
    expect(kill).toHaveBeenCalled()
    expect(words(root).every((word) => word.style.opacity === '')).toBe(true)
  })
})

describe('ScrubText', () => {
  beforeEach(() => vi.clearAllMocks())

  it('scrubs below lg', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: true })
    const { container } = render(
      <ScrubText effect="fill">
        <span data-reveal-word>a</span>
      </ScrubText>,
    )
    expect(container.querySelector('[data-scrub-text="fill"]')).not.toBeNull()
    await waitFor(() => expect(create).toHaveBeenCalled())
  })

  it('does nothing from lg', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: false })
    render(
      <ScrubText effect="rise">
        <span data-reveal-word>a</span>
      </ScrubText>,
    )
    await waitFor(() => expect(loadScrollMotion).toHaveBeenCalled())
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(create).not.toHaveBeenCalled()
  })

  it('does not load motion when it is reduced', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true, [BELOW_LG_QUERY]: true })
    render(
      <ScrubText effect="fill">
        <span data-reveal-word>a</span>
      </ScrubText>,
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(loadScrollMotion).not.toHaveBeenCalled()
  })
})
