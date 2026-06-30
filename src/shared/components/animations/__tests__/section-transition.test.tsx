import { render, screen } from '@/tests/test-utils'
import { SectionTransition } from '../section-transition'

vi.mock('motion/react', () => ({
  motion: {
    div: vi.fn(() => null),
  },
  useReducedMotion: vi.fn(),
  useScroll: vi.fn(),
  useTransform: vi.fn(),
}))

describe('SectionTransition', () => {
  it('renders a static deferred section container', () => {
    const { container } = render(
      <SectionTransition className="section-shell">
        <div>Deferred Section</div>
      </SectionTransition>,
    )

    expect(screen.getByText('Deferred Section')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('relative', 'deferred-section', 'section-shell')
  })

  it('defaults to a positioned wrapper when no className is provided', () => {
    const { container } = render(
      <SectionTransition>
        <div>Default Wrapper</div>
      </SectionTransition>,
    )

    expect(container.firstChild).toHaveClass('relative', 'deferred-section')
  })
})
