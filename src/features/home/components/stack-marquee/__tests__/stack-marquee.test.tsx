import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen } from '@/tests/test-utils'
import { StackMarquee } from '../stack-marquee'

function renderMarquee() {
  return render(<StackMarquee aiLabel="stackAi" productLabel="stackProduct" />)
}

describe('StackMarquee', () => {
  it('renders the items for readers and a hidden copy for the loop', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    renderMarquee()
    expect(screen.getAllByText('React')).toHaveLength(2)
    expect(document.querySelector('[data-loop-copy]')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getAllByText('stackAi')).toHaveLength(2)
    expect(screen.getAllByText('stackProduct')).toHaveLength(2)
  })

  it('animates when motion is allowed', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    renderMarquee()
    expect(document.querySelector('[data-animated]')).toHaveAttribute('data-animated', 'true')
  })

  it('stays static under reduced motion', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    renderMarquee()
    expect(document.querySelector('[data-animated]')).toHaveAttribute('data-animated', 'false')
  })
})
