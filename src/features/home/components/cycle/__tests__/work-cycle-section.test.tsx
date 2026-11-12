import { render, screen } from '@/tests/test-utils'
import ptMessages from '../../../../../../messages/pt.json'
import { WorkCycleSection } from '../work-cycle-section'

vi.mock('next-intl/server', () => ({
  getMessages: vi.fn().mockResolvedValue(ptMessages),
}))

vi.mock('../work-cycle', () => ({
  WorkCycle: ({ copy }: { copy: { chapters: Record<string, { title: string }> } }) => (
    <ul>
      {Object.values(copy.chapters).map((chapter) => (
        <li key={chapter.title}>{chapter.title}</li>
      ))}
    </ul>
  ),
}))

describe('WorkCycleSection', () => {
  it('hands the cycle copy of the current locale to the client cycle', async () => {
    render(await WorkCycleSection())
    expect(screen.getByText('Começa ouvindo.')).toBeInTheDocument()
    expect(screen.getByText('Com IA, sob julgamento.')).toBeInTheDocument()
  })
})
