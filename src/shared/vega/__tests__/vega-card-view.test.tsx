import { render, screen } from '@/tests/test-utils'
import type { VegaCard } from '../vega-card'
import { VegaCardView } from '../vega-card-view'

const card = (image: string | null): VegaCard => ({
  id: image ? 'case-klick' : 'section-atto',
  kind: image ? 'case' : 'section',
  href: image ? '/projects/klick' : '/#atto',
  image,
  title: image ? 'Klick' : 'Atto',
  summary: 'resumo',
})

describe('VegaCardView', () => {
  it('shows the thumbnail column only when the card has an image', () => {
    const { container } = render(
      <VegaCardView
        card={card('/redesign/products/klick-timer.webp')}
        cta="Ver"
        onOpen={vi.fn()}
      />,
    )
    const link = screen.getByRole('link', { name: /Klick/ })
    expect(container.querySelector('[data-card-thumb] img')).not.toBeNull()
    expect(link.className).toContain('grid-cols-[96px_minmax(0,1fr)]')
  })

  it('leaves no empty image slot on a card without an image', () => {
    const { container } = render(<VegaCardView card={card(null)} cta="Ver" onOpen={vi.fn()} />)
    const link = screen.getByRole('link', { name: /Atto/ })
    expect(container.querySelector('[data-card-thumb]')).toBeNull()
    expect(link.className).not.toContain('grid-cols-[96px')
  })
})
