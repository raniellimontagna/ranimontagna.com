import {
  BELOW_LG_QUERY,
  LG_QUERY,
  loadScrollMotion,
  REDUCED_MOTION_QUERY,
} from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen, waitFor } from '@/tests/test-utils'
import pt from '../../../../../../messages/pt.json'
import { AiMethod } from '../ai-method'
import { AI_MODELS, AI_PROOF_IDS, AI_STEP_IDS, AI_TERM_IDS } from '../ai-method.data'
import { AiMethodSteps } from '../ai-method-steps'
import { ModelDeal } from '../ai-model-deal'
import { buildAiRail } from '../ai-rail-motion'

type Tree = { [key: string]: string | string[] | Tree }

function lookup(key: string): string | string[] {
  let node: string | string[] | Tree = pt.aiMethod as Tree
  for (const part of key.split('.')) node = (node as Tree)[part]
  return node as string | string[]
}

vi.mock('next-intl/server', () => ({
  getTranslations: vi
    .fn()
    .mockResolvedValue(
      Object.assign((key: string) => lookup(key) as string, { raw: (key: string) => lookup(key) }),
    ),
}))

vi.mock('../ai-rail-motion', () => ({ buildAiRail: vi.fn(() => () => {}) }))

vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  loadScrollMotion: vi.fn(() => new Promise(() => {})),
}))

describe('AiMethod', () => {
  beforeEach(() => mockMatchMedia({ [REDUCED_MOTION_QUERY]: true }))

  it('renders the AI section heading with anchor ia', async () => {
    render(await AiMethod())
    expect(document.querySelector('section#ia')).not.toBeNull()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Sem amarra de modelo. Com método.' }),
    ).toBeInTheDocument()
  })

  it('lists the six tools with logo and name only', async () => {
    render(await AiMethod())
    const grid = document.querySelector('[data-ai-models]') as HTMLElement
    expect([...grid.querySelectorAll('[data-ai-model]')].map((m) => m.textContent)).toEqual(
      AI_MODELS.map((m) => m.name),
    )
    expect(grid.querySelectorAll('[data-brand-icon]')).toHaveLength(6)
    expect(screen.queryByText(/contexto longo|segunda opinião|agentes de código/i)).toBeNull()
  })

  it('keeps the model grid compact on phones: three columns, 32 px logos', async () => {
    render(await AiMethod())
    const grid = document.querySelector('[data-ai-models]') as HTMLElement
    expect(grid.className).toMatch(/(^|\s)grid-cols-3(\s|$)/)
    expect(grid.querySelector('[data-brand-icon]')?.getAttribute('class')).toContain('h-8')
  })

  it('below lg the steps are a vertical list with a rail, no carousel', async () => {
    render(await AiMethod())
    const steps = document.querySelector('[data-ai-steps]') as HTMLElement
    expect(steps.className).not.toContain('snap-x')
    expect(steps.className).not.toContain('overflow-x-auto')
    expect(steps.className).toContain('flex-col')
    expect(steps.className).toContain('lg:grid-cols-6')
    const rail = document.querySelector('[data-ai-rail]') as HTMLElement
    expect(rail.className).toContain('lg:hidden')
    expect(rail.querySelector('[data-ai-rail-fill]')).not.toBeNull()
    expect(document.querySelector('[data-snap-counter]')).toBeNull()
  })

  it('dims only the step title below lg, down to the body contrast floor', async () => {
    render(await AiMethod())
    for (const step of document.querySelectorAll('[data-ai-step]')) {
      expect(step.querySelector('h4')?.className).toContain(
        'max-lg:group-data-[lit=false]/step:opacity-[var(--dim-body)]',
      )
    }
  })

  it('lets the steps column shrink below its cards, so the carousel never widens the page', async () => {
    render(await AiMethod())
    const column = (document.querySelector('[data-ai-steps]') as HTMLElement).closest(
      '.grid > *',
    ) as HTMLElement
    expect(column.className).toMatch(/(^|\s)min-w-0(\s|$)/)
  })

  it('renders the six method steps in order with artifact lines', async () => {
    render(await AiMethod())
    const steps = [...document.querySelectorAll('[data-ai-step]')]
    expect(steps.map((s) => s.getAttribute('data-ai-step'))).toEqual([...AI_STEP_IDS])
    expect(steps.map((s) => s.querySelector('h4')?.textContent)).toEqual([
      'Conversa',
      'Spec',
      'Plano',
      'Teste primeiro',
      'Agente codifica',
      'Revisão',
    ])
    expect(screen.getByText('eu decido o que vai ao ar')).toBeInTheDocument()
  })

  it('renders the six terms and four proofs', async () => {
    render(await AiMethod())
    expect(document.querySelectorAll('[data-ai-term]')).toHaveLength(AI_TERM_IDS.length)
    expect(document.querySelectorAll('[data-ai-proof]')).toHaveLength(AI_PROOF_IDS.length)
    for (const text of ['SDD', 'AGENTS.md', '6 produtos', '+1.000 testes']) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
    expect(screen.getByText(/o código já aceita o OpenRouter como reserva/)).toBeInTheDocument()
  })

  it('lights every step without motion', async () => {
    render(await AiMethod())
    for (const step of document.querySelectorAll('[data-ai-step]')) {
      expect(step).toHaveAttribute('data-lit', 'true')
    }
  })

  it('keeps step text at full contrast while dimmed: only border and position animate', async () => {
    render(await AiMethod())
    for (const step of document.querySelectorAll('[data-ai-step]')) {
      expect(step.className).not.toMatch(/opacity-/)
    }
  })

  describe('lighting the steps with the scroll', () => {
    const steps = AI_STEP_IDS.map((id) => ({ id, title: id, lines: [id] }))
    const fakeMotion = (create: ReturnType<typeof vi.fn>) =>
      ({
        gsap: {
          matchMedia: () => ({
            add: (conditions: Record<string, string>, callback: () => (() => void) | undefined) => {
              if (Object.values(conditions).some((query) => window.matchMedia(query).matches))
                callback()
            },
            revert: vi.fn(),
          }),
          context: (fn: () => void) => {
            fn()
            return { revert: vi.fn() }
          },
        },
        ScrollTrigger: { create },
      }) as never

    it('below lg it builds the rail and not the lg lighting', async () => {
      mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [LG_QUERY]: false, [BELOW_LG_QUERY]: true })
      const create = vi.fn()
      vi.mocked(loadScrollMotion).mockResolvedValueOnce(fakeMotion(create))
      render(<AiMethodSteps steps={steps} label="steps" />)
      await waitFor(() =>
        expect(buildAiRail).toHaveBeenCalledWith(expect.anything(), expect.any(HTMLOListElement)),
      )
      expect(create).not.toHaveBeenCalled()
    })

    it('lights them with the vertical scroll from lg up', async () => {
      mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [LG_QUERY]: true })
      const create = vi.fn()
      vi.mocked(loadScrollMotion).mockResolvedValueOnce(fakeMotion(create))
      render(<AiMethodSteps steps={steps} label="steps" />)
      await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    })
  })

  describe('ModelDeal', () => {
    const motion = () => {
      const set = vi.fn()
      const to = vi.fn()
      const create = vi.fn()
      return {
        set,
        create,
        value: {
          gsap: {
            set,
            to,
            matchMedia: () => ({
              add: (conditions: Record<string, string>, callback: () => void) => {
                if (Object.values(conditions).some((query) => window.matchMedia(query).matches))
                  callback()
              },
              revert: vi.fn(),
            }),
          },
          ScrollTrigger: { create },
        } as never,
      }
    }
    const grid = (
      <ModelDeal>
        <ul data-ai-models>
          <li>Claude</li>
          <li>Codex</li>
        </ul>
      </ModelDeal>
    )

    it('deals the tiles in below lg when the grid is below the fold', async () => {
      mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: true })
      const fake = motion()
      vi.mocked(loadScrollMotion).mockResolvedValueOnce(fake.value)
      const spy = vi
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockReturnValue({ top: 5000 } as DOMRect)
      render(grid)
      await waitFor(() => expect(fake.set).toHaveBeenCalled())
      expect(fake.set).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ rotationX: -75, y: 16, opacity: 0 }),
      )
      expect(fake.create).toHaveBeenCalledWith(
        expect.objectContaining({ start: 'top 85%', once: true }),
      )
      spy.mockRestore()
    })

    it('never hides tiles already on screen', async () => {
      mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: true })
      const fake = motion()
      vi.mocked(loadScrollMotion).mockResolvedValueOnce(fake.value)
      render(grid)
      await waitFor(() => expect(loadScrollMotion).toHaveBeenCalled())
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(fake.set).not.toHaveBeenCalled()
    })
  })
})
