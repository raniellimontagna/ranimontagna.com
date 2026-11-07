import {
  DESKTOP_QUERY,
  LG_QUERY,
  loadScrollMotion,
  MOBILE_QUERY,
  REDUCED_MOTION_QUERY,
} from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen, waitFor } from '@/tests/test-utils'
import { LiveWork } from '../live-work'
import { LIVE_WORK } from '../live-work.data'
import { buildLiveTrack } from '../live-work-motion'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

const matchMedia = vi.fn(() => ({
  add: (
    conditions: Record<string, string>,
    callback: (context: { conditions: Record<string, boolean> }) => void,
  ) => {
    const states = Object.fromEntries(
      Object.entries(conditions).map(([name, query]) => [name, window.matchMedia(query).matches]),
    )
    if (Object.values(states).some(Boolean)) callback({ conditions: states })
  },
  revert: vi.fn(),
}))

vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  loadScrollMotion: vi.fn(() =>
    Promise.resolve({
      gsap: {
        matchMedia,
        context: (fn: () => void) => {
          fn()
          return { revert: vi.fn() }
        },
      },
      ScrollTrigger: { sort: vi.fn(), refresh: vi.fn() },
    }),
  ),
}))
vi.mock('../live-work-motion', () => ({ buildLiveTrack: vi.fn() }))

describe('LiveWork', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists the five projects in order with links to the cases', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await LiveWork())
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual([
      'items.grimory.name',
      'items.klick.name',
      'items.agent-toolkit.name',
      'items.argus.name',
      'items.atto-read.name',
    ])
    expect(screen.getByRole('link', { name: /items\.grimory\.name/ })).toHaveAttribute(
      'href',
      '/projects/grimory',
    )
    expect(screen.getByRole('link', { name: /items\.klick\.name/ })).toHaveAttribute(
      'href',
      '/projects/klick',
    )
    expect(document.getElementById('no-ar')).toBeInTheDocument()
  })

  it('never renders an empty image slot', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await LiveWork())
    const cards = document.querySelectorAll('[data-live-card]')
    expect(cards).toHaveLength(LIVE_WORK.length)
    for (const card of cards) {
      expect(card.querySelector('img, [data-card-art]')).not.toBeNull()
    }
  })

  it('does not load motion under reduced motion', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await LiveWork())
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(loadScrollMotion).not.toHaveBeenCalled()
  })

  it('pins the horizontal track only where the layout is horizontal (lg and up)', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true, [LG_QUERY]: true })
    render(await LiveWork())
    await waitFor(() => expect(buildLiveTrack).toHaveBeenCalled())
  })

  it('keeps the vertical list on tablets between the phone and lg breakpoints', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true })
    render(await LiveWork())
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(buildLiveTrack).not.toHaveBeenCalled()
  })

  it('keeps a vertical list on phones', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [MOBILE_QUERY]: true })
    render(await LiveWork())
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(buildLiveTrack).not.toHaveBeenCalled()
  })
})
