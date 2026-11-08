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

const LEMON_PT = {
  role: 'Engenheiro de software · Lemon Energia',
  period: 'Julho 2026 - hoje · time de IA, dentro de Finanças',
  what: 'No time de IA da Lemon, trabalho de dentro de uma área de negócio: vivo a operação de Finanças, encontro o trabalho manual e decido o que vira produto. Desde agosto, coloquei seis produtos internos em produção, da tela ao banco e à infraestrutura na AWS.',
  impact: [
    'Seis produtos de finanças em três meses: conciliação bancária, lotes de pagamento, fornecedores, notas fiscais e notas de débito',
    'Cada um de ponta a ponta: front em React, API em Fastify com PostgreSQL e a infraestrutura escrita em código com Pulumi',
    'Na AWS: containers no ECS Fargate, banco no Aurora (RDS), eventos com EventBridge e SQS, segredos no Secrets Manager, entrega por API Gateway e CloudFront',
    'Ritmo alto de entrega, com agentes de IA no fluxo e revisão crítica antes de ir ao ar',
  ],
}

describe('Trajectory', () => {
  beforeEach(() => {
    toggles.length = 0
  })

  it('renders four stages oldest first ending with Lemon', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await Trajectory())
    const stages = document.querySelectorAll('[data-stage]')
    expect([...stages].map((a) => a.getAttribute('data-stage'))).toEqual([
      'sbsistemas',
      'smarten',
      'luizalabs',
      'lemon',
    ])
    expect([...stages].map((a) => a.querySelector('[data-year]')?.textContent)).toEqual([
      '2021',
      '2022',
      '2023',
      '2026',
    ])
    expect(screen.getByText('stages.lemon.role')).toBeVisible()
    expect(document.getElementById('trajetoria')).toBeInTheDocument()
  })

  it('has no Atto and no photos inside the trajectory', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await Trajectory())
    const section = document.getElementById('trajetoria') as HTMLElement
    expect(section.querySelector('[aria-label="Atto"]')).toBeNull()
    expect(section.textContent).not.toMatch(/atto/i)
    expect(section.querySelectorAll('img')).toHaveLength(0)
  })

  it('paints each panel and mobile band with the company color', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await Trajectory())
    const panel = (id: string) =>
      document.querySelector(`[data-stage-panel="${id}"]`) as HTMLElement
    expect(panel('sbsistemas').style.backgroundColor).toBe('rgb(4, 91, 168)')
    expect(panel('lemon').style.backgroundColor).toBe('rgb(0, 60, 0)')
    const band = document.querySelector('[data-stage-band="lemon"]') as HTMLElement
    expect(band.style.backgroundColor).toBe('rgb(0, 60, 0)')
    expect(panel('lemon').querySelector('[data-company-logo]')?.getAttribute('style')).toContain(
      '/companies/white/lemon.png',
    )
  })

  it('renders the stack as tech chips', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await Trajectory())
    const smarten = document.querySelector('[data-stage="smarten"]') as HTMLElement
    const chip = (label: string) =>
      [...smarten.querySelectorAll('li')].find((li) => li.textContent === label) as HTMLElement
    expect(chip('CI/CD').querySelector('[data-brand-icon]')).toBeNull()
    expect(chip('React').querySelector('[data-brand-icon="react"]')).not.toBeNull()
  })

  it('keeps the first stage and panel active without motion', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(await Trajectory())
    for (const stage of STAGES) {
      expect(screen.getByText(`stages.${stage.id}.impact.0`)).toBeVisible()
    }
    expect(document.querySelector('[data-stage="sbsistemas"]')).toHaveAttribute(
      'data-active',
      'true',
    )
    expect(document.querySelector('[data-stage-panel="sbsistemas"]')).toHaveAttribute(
      'data-active',
      'true',
    )
  })

  it('marks the active stage and its panel from the scroll position', async () => {
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
    expect(document.querySelector('[data-stage-panel="luizalabs"]')).toHaveAttribute(
      'data-active',
      'true',
    )
    expect(document.querySelector('[data-stage-panel="sbsistemas"]')).toHaveAttribute(
      'data-active',
      'false',
    )
  })
})

describe('Luizalabs stage', () => {
  const TOOLS = ['Go', 'GCP', 'RabbitMQ', 'SonarQube', 'Grafana']

  it('lists Go, GCP, RabbitMQ, SonarQube and Grafana in its stack, with Go in the panel', async () => {
    const { STAGES } = await import('../trajectory.data')
    const luizalabs = STAGES.find((stage) => stage.id === 'luizalabs')
    for (const tool of TOOLS) expect(luizalabs?.stack).toContain(tool)
    expect(luizalabs?.panelIcons).toContain('go')
  })

  it.each(['pt', 'en', 'es'])(
    'tells the Go back end, the tools and Black Friday in %s',
    async (locale) => {
      const messages = (await import(`../../../../../../messages/${locale}.json`)).default
      const stage = messages.trajectory.stages.luizalabs as { what: string; impact: string[] }
      const text = [stage.what, ...stage.impact].join(' ')
      for (const tool of ['Go', 'GCP', 'RabbitMQ', 'SonarQube', 'Grafana', 'Black Friday']) {
        expect(text).toContain(tool)
      }
      // The published store numbers stay as they were.
      expect(text).toMatch(/1[.,]000\+/)
    },
  )
})

describe('trajectory messages', () => {
  it('carry the approved Lemon text in pt and drop Atto and photo alts', async () => {
    const pt = (await import('../../../../../../messages/pt.json')).default
    const stages = pt.trajectory.stages as Record<string, Record<string, unknown>>
    expect(stages.lemon).toEqual(LEMON_PT)
    expect(stages['lemon-atto']).toBeUndefined()
    for (const stage of Object.values(stages)) expect(stage.photoAlt).toBeUndefined()
  })
})
