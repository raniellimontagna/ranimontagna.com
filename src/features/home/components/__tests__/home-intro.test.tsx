import { render, screen } from '@/tests/test-utils'
import { HomeIntro } from '../home-intro'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('../stack-marquee/stack-marquee', () => ({
  StackMarquee: ({ aiLabel, productLabel }: { aiLabel: string; productLabel: string }) => (
    <p data-testid="marquee">{`${aiLabel} ${productLabel}`}</p>
  ),
}))

vi.mock('../cycle/work-cycle-section', () => ({
  WorkCycleSection: () => <section data-testid="cycle" />,
}))

describe('HomeIntro', () => {
  it('renders the translated stack marquee and then the work cycle', async () => {
    render(await HomeIntro())
    const marquee = screen.getByTestId('marquee')
    expect(marquee).toHaveTextContent('stackAi stackProduct')
    expect(
      marquee.compareDocumentPosition(screen.getByTestId('cycle')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
