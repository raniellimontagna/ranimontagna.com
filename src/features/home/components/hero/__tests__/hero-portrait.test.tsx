import {
  DESKTOP_QUERY,
  loadScrollMotion,
  MOBILE_QUERY,
  REDUCED_MOTION_QUERY,
} from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, waitFor } from '@/tests/test-utils'
import { HeroPortrait } from '../hero-portrait'

const create = vi.fn()
const to = vi.fn()
const revert = vi.fn()
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
  revert,
}))
const motion = {
  gsap: { to, matchMedia },
  ScrollTrigger: { create },
}

vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  loadScrollMotion: vi.fn(() => Promise.resolve(motion)),
}))

vi.mock('@/features/home/components/portrait/code-portrait', () => ({
  CodePortrait: () => <div data-testid="code-portrait" />,
}))

function renderInSection() {
  return render(
    <section data-hero-2026>
      <h1 data-hero-title>Ranielli</h1>
      <HeroPortrait src="/photo.webp" alt="portrait" />
    </section>,
  )
}

describe('HeroPortrait', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads no scroll motion under reduced motion', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    renderInSection()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(loadScrollMotion).not.toHaveBeenCalled()
  })

  it('scrubs the reveal over the whole hero on desktop and parallaxes the title', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true })
    const { container } = renderInSection()
    await waitFor(() => expect(create).toHaveBeenCalled())
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: container.querySelector('[data-hero-2026]'),
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }),
    )
    expect(to).toHaveBeenCalledWith(
      container.querySelector('[data-hero-title]'),
      expect.objectContaining({ yPercent: -18 }),
    )
  })

  it('reveals sooner on phones', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [MOBILE_QUERY]: true })
    renderInSection()
    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(expect.objectContaining({ end: '+=55%' })),
    )
  })

  it('reverts the scroll animations on unmount', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true })
    const { unmount } = renderInSection()
    await waitFor(() => expect(create).toHaveBeenCalled())
    unmount()
    expect(revert).toHaveBeenCalled()
  })

  it('rebuilds the reveal per breakpoint through gsap.matchMedia (rotation)', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true })
    renderInSection()
    await waitFor(() => expect(matchMedia).toHaveBeenCalled())
  })
})
