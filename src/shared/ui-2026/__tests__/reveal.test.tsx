import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { Reveal } from '../reveal'

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
