import { BELOW_LG_QUERY, REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { installFrameStub } from '@/tests/mocks/canvas'
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

  describe('lean with scroll speed', () => {
    const track = () => document.querySelector('[data-animated] > div') as HTMLElement
    const skew = () => {
      const match = track().style.transform.match(/skewX\((-?[\d.]+)deg\)/)
      return match ? Number.parseFloat(match[1]) : null
    }
    const scrollBy = (delta: number) => {
      Object.defineProperty(window, 'scrollY', {
        value: window.scrollY + delta,
        configurable: true,
        writable: true,
      })
    }
    afterEach(() => {
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true })
      vi.restoreAllMocks()
    })

    it('below lg skews with scroll speed, clamped to 6deg', () => {
      mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: true })
      const frames = installFrameStub()
      renderMarquee()
      for (let i = 0; i < 80; i++) {
        scrollBy(1000)
        frames.flush()
      }
      const value = skew()
      expect(value).not.toBeNull()
      expect(value as number).toBeLessThan(-5.9)
      expect(value as number).toBeGreaterThanOrEqual(-6)
    })

    it('follows the query live: crossing to lg drops the lean, crossing back brings it', () => {
      mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: false })
      const frames = installFrameStub()
      renderMarquee()
      const lists = vi
        .mocked(window.matchMedia)
        .mock.results.map((result) => result.value as { media: string; matches: boolean })
        .filter((list) => list.media === BELOW_LG_QUERY)
      expect(lists.length).toBeGreaterThan(0)
      for (const list of lists) list.matches = true
      for (let i = 0; i < 20; i++) {
        scrollBy(1000)
        frames.flush()
      }
      expect(skew()).not.toBeNull()
      for (const list of lists) list.matches = false
      frames.flush()
      expect(track().style.transform).not.toContain('skewX')
    })

    it('from lg never skews', () => {
      mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [BELOW_LG_QUERY]: false })
      const frames = installFrameStub()
      renderMarquee()
      for (let i = 0; i < 10; i++) {
        scrollBy(1000)
        frames.flush()
      }
      expect(track().style.transform).not.toContain('skewX')
    })
  })
})
