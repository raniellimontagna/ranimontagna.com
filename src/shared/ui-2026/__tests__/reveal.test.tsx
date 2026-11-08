import { BELOW_LG_QUERY, REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { Reveal } from '../reveal'
import { WordReveal } from '../word-reveal'

const set = vi.fn()
const to = vi.fn()
const batch = vi.fn()

vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  loadScrollMotion: vi.fn(() =>
    Promise.resolve({
      gsap: {
        set,
        to,
        context: (fn: () => void) => {
          fn()
          return { revert: vi.fn() }
        },
      },
      ScrollTrigger: { batch },
    }),
  ),
}))

describe('Reveal and the keyboard', () => {
  it('keeps hidden-below-the-fold links focusable and shows one as soon as it gets focus', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 5000,
    } as DOMRect)
    render(
      <Reveal>
        <a data-reveal href="/x">
          Ver o case do Klick
        </a>
      </Reveal>,
    )
    await waitFor(() => expect(set).toHaveBeenCalled())
    const [, from] = set.mock.calls[0] as [unknown, Record<string, unknown>]
    expect(from).not.toHaveProperty('autoAlpha')
    expect(from).not.toHaveProperty('visibility')

    const link = screen.getByRole('link', { name: 'Ver o case do Klick' })
    fireEvent.focusIn(link)
    expect(to).toHaveBeenCalledWith(link, expect.objectContaining({ opacity: 1 }))
    vi.restoreAllMocks()
  })
})

describe('Reveal on phones', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 5000,
    } as DOMRect)
  })
  afterEach(() => vi.restoreAllMocks())

  const title = (
    <Reveal>
      <WordReveal text="Tem um problema" />
      <p data-reveal>lead</p>
    </Reveal>
  )

  it('below lg words rise from a mask (yPercent 110, no opacity)', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: true })
    render(title)
    await waitFor(() => expect(set).toHaveBeenCalledTimes(2))
    const words = document.querySelectorAll('[data-reveal-word]')
    expect(set).toHaveBeenCalledWith([...words], { yPercent: 110 })
    expect(set).toHaveBeenCalledWith([document.querySelector('p[data-reveal]')], {
      y: 24,
      opacity: 0,
    })
    for (const word of words) {
      expect(word.parentElement?.className).toContain('max-lg:overflow-hidden')
    }
  })

  it('below lg skips targets inside [data-scrub-text]', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: true })
    render(
      <Reveal>
        <div data-scrub-text="rise">
          <span data-reveal-word>R</span>
        </div>
        <p data-reveal>lead</p>
      </Reveal>,
    )
    await waitFor(() => expect(set).toHaveBeenCalledTimes(1))
    expect(set).toHaveBeenCalledWith([document.querySelector('p[data-reveal]')], {
      y: 24,
      opacity: 0,
    })
  })

  it('from lg words keep y 24 and opacity', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: false })
    render(title)
    await waitFor(() => expect(set).toHaveBeenCalledTimes(1))
    const [targets, from] = set.mock.calls[0] as [Element[], Record<string, unknown>]
    expect(targets).toHaveLength(4)
    expect(from).toEqual({ y: 24, opacity: 0 })
  })
})
