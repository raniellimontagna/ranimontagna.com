import { render } from '@/tests/test-utils'
import { HomeBody } from '../../home-body'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))
vi.mock('../../stack-marquee/stack-marquee', () => ({
  StackMarquee: () => <div data-mark="marquee" />,
}))
vi.mock('../../cycle/work-cycle-section', () => ({
  WorkCycleSection: async () => <div data-mark="cycle" />,
}))
vi.mock('../ai-method', () => ({ AiMethod: async () => <div data-mark="ia" /> }))
vi.mock('../../interlude/interlude', () => ({
  Interlude: async () => <div data-mark="interlude" />,
}))
vi.mock('../../live-work/live-work', () => ({ LiveWork: async () => <div data-mark="live" /> }))
vi.mock('../../trajectory/trajectory', () => ({
  Trajectory: async () => <div data-mark="trajectory" />,
}))
vi.mock('../../atto/atto-section', () => ({ AttoSection: async () => <div data-mark="atto" /> }))
vi.mock('../../writing/writing', () => ({ Writing: async () => <div data-mark="writing" /> }))
vi.mock('../../closing/closing', () => ({ Closing: async () => <div data-mark="closing" /> }))

describe('HomeBody order', () => {
  it('places the AI section right after the cycle', async () => {
    render(await HomeBody({ locale: 'pt' }))
    const order = [...document.querySelectorAll('[data-mark]')].map((n) =>
      n.getAttribute('data-mark'),
    )
    expect(order.slice(0, 4)).toEqual(['marquee', 'cycle', 'ia', 'interlude'])
  })
})
