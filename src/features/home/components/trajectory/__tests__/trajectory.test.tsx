import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { act, render, screen, waitFor } from '@/tests/test-utils'
import { Trajectory } from '../trajectory'
import { STAGES } from '../trajectory.data'

vi.mock('next-intl/server', () => ({
  getTranslations: vi
    .fn()
    .mockResolvedValue(
      Object.assign((key: string) => key, { raw: (key: string) => [`${key}.0`, `${key}.1`] }),
    ),
}))

const toggles: Array<(self: { isActive: boolean }) => void> = []
vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  loadScrollMotion: vi.fn(() =>
    Promise.resolve({
      gsap: {
        context: (fn: () => void) => {
          fn()
          return { revert: vi.fn() }
        },
        fromTo: vi.fn(),
        set: vi.fn(),
      },
      ScrollTrigger: {
        create: vi.fn((options: { onToggle: (self: { isActive: boolean }) => void }) => {
          toggles.push(options.onToggle)
        }),
      },
    }),
  ),
}))

describe('Trajectory', () => {
  beforeEach(() => {
    toggles.length = 0
  })

  it('renders every stage in order with logo, role, period and stack', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await Trajectory())
    const articles = document.querySelectorAll('[data-stage]')
    expect([...articles].map((a) => a.getAttribute('data-stage'))).toEqual(STAGES.map((s) => s.id))
    expect([...articles].map((a) => a.querySelector('[data-year]')?.textContent)).toEqual([
      '2021',
      '2022',
      '2023',
      '2026',
    ])
    expect(screen.getByRole('img', { name: 'Atto' })).toBeInTheDocument()
    expect(screen.getByAltText('Luizalabs')).toBeInTheDocument()
    expect(document.getElementById('trajetoria')).toBeInTheDocument()
  })

  it('all stage text is server-rendered and visible without motion', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await Trajectory())
    for (const stage of STAGES) {
      expect(screen.getByText(`stages.${stage.id}.role`)).toBeVisible()
      expect(screen.getByText(`stages.${stage.id}.impact.0`)).toBeVisible()
    }
    expect(document.querySelector('[data-stage="sbsistemas"]')).toHaveAttribute(
      'data-active',
      'true',
    )
  })

  it('marks the active stage and its photo from the scroll position', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    render(await Trajectory())
    await waitFor(() => expect(toggles).toHaveLength(STAGES.length))
    act(() => toggles[2]({ isActive: true }))
    expect(document.querySelector('[data-stage="luizalabs"]')).toHaveAttribute(
      'data-active',
      'true',
    )
    expect(document.querySelector('[data-stage="sbsistemas"]')).toHaveAttribute(
      'data-active',
      'false',
    )
    expect(document.querySelector('[data-stage-photo="luizalabs"]')).toHaveAttribute(
      'data-active',
      'true',
    )
  })
})
