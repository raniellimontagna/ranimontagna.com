import {
  DESKTOP_QUERY,
  loadScrollMotion,
  MOBILE_QUERY,
  REDUCED_MOTION_QUERY,
} from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen, waitFor } from '@/tests/test-utils'
import type { CycleCopy } from '../cycle.data'
import { TERMINAL_LINES } from '../cycle.data'
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

  it('builds the timeline for the current breakpoint', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    await waitFor(() =>
      expect(buildCycleTimeline).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(HTMLElement),
        expect.objectContaining({ mobile: false }),
      ),
    )
  })

  it('builds the phone timeline on small screens', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [MOBILE_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    await waitFor(() =>
      expect(buildCycleTimeline).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(HTMLElement),
        expect.objectContaining({ mobile: true }),
      ),
    )
  })

  it('hides terminal lines the scroll has not reached', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true })
    render(<WorkCycle copy={copy} />)
    await waitFor(() => expect(buildCycleTimeline).toHaveBeenCalled())
    const [, , options] = vi.mocked(buildCycleTimeline).mock.calls[0]
    options.onTerminal(3)
    expect(document.querySelectorAll('[data-terminal-line]:not([hidden])')).toHaveLength(3)
  })

  it('reverts the scroll animations on unmount', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true })
    const { unmount } = render(<WorkCycle copy={copy} />)
    await waitFor(() => expect(buildCycleTimeline).toHaveBeenCalled())
    unmount()
    expect(revert).toHaveBeenCalled()
  })
  it('re-sorts and refreshes every ScrollTrigger once the pin exists, so later pins start below it', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true })
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
  })
})
