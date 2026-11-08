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

  it('lists the round-2 stack in order with icons', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    renderMarquee()
    const first = document.querySelector('ul:not([data-loop-copy])') as HTMLElement
    const labels = [...first.querySelectorAll('li')].map((li) =>
      li.textContent?.replace('✦', '').trim(),
    )
    expect(labels).toEqual([
      'React',
      'Next.js',
      'React Native',
      'Node.js',
      'TypeScript',
      'Fastify',
      'PostgreSQL',
      'AWS',
      'Pulumi',
      'Cloudflare',
      'Svelte',
      'Claude',
      'Codex',
      'Gemini',
      'DeepSeek',
      'MCP',
      'stackAi',
      'stackProduct',
    ])
    expect(first.querySelectorAll('[data-brand-icon]')).toHaveLength(16)
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
