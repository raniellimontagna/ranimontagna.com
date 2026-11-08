import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen } from '@/tests/test-utils'
import pt from '../../../../../../messages/pt.json'
import { AiMethod } from '../ai-method'
import { AI_MODELS, AI_PROOF_IDS, AI_STEP_IDS, AI_TERM_IDS } from '../ai-method.data'

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
})
