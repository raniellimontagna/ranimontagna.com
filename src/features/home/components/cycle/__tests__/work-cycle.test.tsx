import {
  BELOW_LG_QUERY,
  DESKTOP_QUERY,
  LG_QUERY,
  loadScrollMotion,
  MOBILE_QUERY,
  REDUCED_MOTION_QUERY,
} from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen, waitFor } from '@/tests/test-utils'
import type { CycleCopy } from '../cycle.data'
import { TERMINAL_LINES } from '../cycle.data'
import { buildCycleStack } from '../cycle-stack-motion'
import { buildCycleTimeline } from '../cycle-timeline'
import { WorkCycle } from '../work-cycle'

const revert = vi.fn()
const scrollTrigger = { sort: vi.fn(), refresh: vi.fn() }
const matchMedia = vi.fn(() => ({
  add: (
    conditions: Record<string, string>,
    callback: (context: { conditions: Record<string, boolean> }) => (() => void) | undefined,
  ) => {
    const states = Object.fromEntries(
      Object.entries(conditions).map(([name, query]) => [name, window.matchMedia(query).matches]),
    )
    if (Object.values(states).some(Boolean)) callback({ conditions: states })
  },
  revert,
}))

vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  loadScrollMotion: vi.fn(() =>
    Promise.resolve({ gsap: { matchMedia }, ScrollTrigger: scrollTrigger }),
  ),
}))

vi.mock('../cycle-timeline', () => ({ buildCycleTimeline: vi.fn() }))
vi.mock('../cycle-stack-motion', () => ({ buildCycleStack: vi.fn(() => () => {}) }))

const { imageCalls } = vi.hoisted(() => ({
  imageCalls: [] as Array<{ src: unknown; quality?: unknown }>,
}))
vi.mock('next/image', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/image')>()
  return {
    ...actual,
    getImageProps: (props: Parameters<typeof actual.getImageProps>[0]) => {
      imageCalls.push({ src: props.src, quality: props.quality })
      return actual.getImageProps(props)
    },
  }
})

const chapter = (id: string) => ({
  kicker: `${id}.kicker`,
  title: `${id}.title`,
  body: `${id}.body`,
})

const copy: CycleCopy = {
  heading: 'heading',
  chapters: {
    pain: chapter('pain'),
    solution: chapter('solution'),
    product: chapter('product'),
    code: chapter('code'),
  },
  thread: { caption: 'caption', messages: [{ from: 'cuber', text: 'lost my history' }] },
  spec: { title: 'spec.title', items: ['spec.item'] },
  product: { desktopAlt: 'desktopAlt', phoneAlt: 'phoneAlt' },
  casesLink: 'casesLink',
}

describe('WorkCycle', () => {
  beforeEach(() => vi.clearAllMocks())

  it('first render shows all four chapters stacked and readable', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    for (const id of ['pain', 'solution', 'product', 'code']) {
      expect(screen.getByText(`${id}.title`)).toBeVisible()
    }
    expect(screen.getByRole('heading', { level: 2, name: 'heading' })).toBeInTheDocument()
  })

  it('asks the optimizer for high quality on the full-screen scene backgrounds', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    imageCalls.length = 0
    render(<WorkCycle copy={copy} />)
    const scenes = imageCalls.filter((call) => String(call.src).includes('/redesign/scenes/'))
    expect(scenes).toHaveLength(4)
    for (const call of scenes) expect(call.quality).toBe(90)
    const config = (await import('../../../../../../next.config')).default
    expect(config.images?.qualities).toContain(90)
  })

  it('treats each scene with a directional scrim and film grain instead of a flat overlay', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    const scenes = document.querySelectorAll('[data-scene]')
    expect(scenes).toHaveLength(4)
    for (const scene of scenes) {
      expect(scene.querySelector('[data-scene-scrim]')).not.toBeNull()
      expect(scene.querySelector('[data-scene-grain]')).not.toBeNull()
      expect(scene.querySelector('.bg-background\\/75')).toBeNull()
      // On phones the subject sits on the right of the frame: keep it in view.
      expect(scene.querySelector('[data-scene-bg]')?.className).toContain('object-[72%_50%]')
    }
  })

  it('shows every terminal line without motion', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    expect(document.querySelectorAll('[data-terminal-line]:not([hidden])')).toHaveLength(
      TERMINAL_LINES.length,
    )
  })

  it('does not load motion under reduced motion', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(loadScrollMotion).not.toHaveBeenCalled()
  })

  it('pins and builds the timeline from lg up', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true, [LG_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    await waitFor(() =>
      expect(buildCycleTimeline).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(HTMLElement),
        expect.objectContaining({ onTerminal: expect.any(Function) }),
      ),
    )
    expect(document.getElementById('como-trabalho')).toHaveAttribute('data-pinned', 'true')
  })

  it('does not pin below lg: phones and tablets scroll the scenes normally', async () => {
    vi.mocked(buildCycleTimeline).mockClear()
    for (const query of [MOBILE_QUERY, DESKTOP_QUERY]) {
      mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [query]: true })
      const { unmount } = render(<WorkCycle copy={copy} />)
      await waitFor(() => expect(loadScrollMotion).toHaveBeenCalled())
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(buildCycleTimeline).not.toHaveBeenCalled()
      expect(document.getElementById('como-trabalho')).not.toHaveAttribute('data-pinned', 'true')
      unmount()
    }
  })

  it('ships every chapter sticky with svh and no scroll-scene class', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    const scenes = document.querySelectorAll('[data-scene]')
    expect(scenes).toHaveLength(4)
    for (const scene of scenes) {
      expect(scene.className).toContain('max-lg:sticky')
      expect(scene.className).toContain('max-lg:top-0')
      expect(scene.className).toContain('max-lg:h-svh')
      expect(scene.className).toContain('lg:min-h-[100svh]')
      expect(scene.querySelector('[data-scene-dim]')).not.toBeNull()
    }
    expect(document.querySelector('.scroll-scene, .scroll-scene-copy')).toBeNull()
  })

  it('keeps each chapter inside one short phone screen: tighter padding, a lower terminal cap', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    const grid = document.querySelector('[data-scene-art]')?.parentElement as HTMLElement
    for (const token of ['pt-24', 'pb-8', 'gap-6', 'lg:pt-28', 'lg:pb-16', 'lg:gap-16']) {
      expect(grid.className.split(' ')).toContain(token)
    }
    expect(document.querySelector('[data-terminal-line]')?.parentElement?.className).toContain(
      'max-lg:[@media(max-height:700px)]:max-h-[30svh]',
    )
  })

  it('renders a reading spacer after the last chapter and progress bars that follow the header', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    const spacer = document.querySelector('[data-stack-spacer]')
    expect(spacer?.className).toContain('h-[50svh]')
    expect(spacer?.previousElementSibling).toHaveAttribute('data-scene', 'code')
    const bars = document.querySelector('[data-stack-bars]')
    expect(bars).toHaveAttribute('data-follow-header')
    expect(bars?.querySelectorAll('[data-stack-bar]')).toHaveLength(4)
  })

  it('below lg it builds the stack, not the pinned timeline', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: true, [LG_QUERY]: false })
    render(<WorkCycle copy={copy} />)
    await waitFor(() =>
      expect(buildCycleStack).toHaveBeenCalledWith(expect.anything(), expect.any(HTMLElement)),
    )
    expect(buildCycleTimeline).not.toHaveBeenCalled()
  })

  it('from lg it pins as before and never stacks', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: false, [LG_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    await waitFor(() => expect(buildCycleTimeline).toHaveBeenCalled())
    expect(buildCycleStack).not.toHaveBeenCalled()
  })

  it('reduced motion builds nothing and shows every terminal line', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true, [BELOW_LG_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(buildCycleStack).not.toHaveBeenCalled()
    expect(document.querySelectorAll('[data-terminal-line]:not([hidden])')).toHaveLength(
      TERMINAL_LINES.length,
    )
  })

  it('hides terminal lines the scroll has not reached', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [LG_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    await waitFor(() => expect(buildCycleTimeline).toHaveBeenCalled())
    const [, , options] = vi.mocked(buildCycleTimeline).mock.calls[0]
    options.onTerminal(3)
    expect(document.querySelectorAll('[data-terminal-line]:not([hidden])')).toHaveLength(3)
  })

  it('reverts the scroll animations on unmount', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [LG_QUERY]: true })
    const { unmount } = render(<WorkCycle copy={copy} />)
    await waitFor(() => expect(buildCycleTimeline).toHaveBeenCalled())
    unmount()
    expect(revert).toHaveBeenCalled()
  })
  it('re-sorts and refreshes every ScrollTrigger once the pin exists, so later pins start below it', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [LG_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    await waitFor(() => expect(scrollTrigger.refresh).toHaveBeenCalled())
    expect(scrollTrigger.sort).toHaveBeenCalled()
    expect(vi.mocked(buildCycleTimeline).mock.invocationCallOrder[0]).toBeLessThan(
      scrollTrigger.sort.mock.invocationCallOrder[0],
    )
  })
  it('keeps a decorative cursor at the end of the terminal', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    expect(document.querySelector('[data-terminal-cursor]')).toHaveAttribute('aria-hidden', 'true')
  })
  it('carries the como-trabalho id and ends with a link to the live work', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    expect(document.getElementById('como-trabalho')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'casesLink' })).toHaveAttribute('href', '#no-ar')
    expect(screen.getByRole('link', { name: 'casesLink' }).className).toContain('min-h-11')
  })

  it('does not query the DOM on every terminal tick', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [LG_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    await waitFor(() => expect(buildCycleTimeline).toHaveBeenCalled())
    const [, root, options] = vi.mocked(buildCycleTimeline).mock.calls[0]
    const spy = vi.spyOn(root as HTMLElement, 'querySelectorAll')
    options.onTerminal(1)
    options.onTerminal(2)
    options.onTerminal(3)
    expect(spy).not.toHaveBeenCalled()
  })
})
