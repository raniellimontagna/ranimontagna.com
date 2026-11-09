import { loadScrollMotion, REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { render, screen } from '@/tests/test-utils'
import { ActionLink } from '../action-link'
import { PhotoReveal } from '../photo-reveal'
import { Reveal } from '../reveal'
import { SectionHeading } from '../section-heading'
import { WordReveal } from '../word-reveal'

vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  loadScrollMotion: vi.fn(() => new Promise(() => {})),
}))

describe('WordReveal', () => {
  it('keeps the sentence accessible and splits words', () => {
    render(<WordReveal text="Coloca no ar." />)
    expect(screen.getByRole('heading', { level: 2, name: 'Coloca no ar.' })).toBeInTheDocument()
    expect(document.querySelectorAll('[data-reveal-word]')).toHaveLength(3)
    for (const word of document.querySelectorAll('[data-reveal-word]')) {
      expect(word).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('keeps the space between words outside the word masks, where it cannot collapse', () => {
    render(<WordReveal text="Coloca no ar." />)
    const masks = [...document.querySelectorAll('[data-reveal-word]')].map(
      (word) => word.parentElement as HTMLElement,
    )
    for (const word of document.querySelectorAll('[data-reveal-word]')) {
      expect(word.textContent).not.toMatch(/\s/)
    }
    expect(masks[0].nextSibling?.textContent).toBe(' ')
    expect(masks[1].nextSibling?.textContent).toBe(' ')
    expect(masks[2].nextSibling).toBeNull()
  })

  it('renders as the requested element', () => {
    render(<WordReveal text="Oi" as="p" />)
    const sentence = screen.getByText('Oi', { selector: '.sr-only' })
    expect(sentence.closest('p')).not.toBeNull()
    expect(sentence.closest('p')).not.toHaveAttribute('aria-label')
  })
})

describe('Reveal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads no motion under reduced motion and hides nothing', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(
      <Reveal>
        <p data-reveal>texto</p>
      </Reveal>,
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(loadScrollMotion).not.toHaveBeenCalled()
    expect(screen.getByText('texto')).toBeVisible()
  })

  it('loads scroll motion when motion is allowed', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    render(
      <Reveal>
        <p data-reveal>texto</p>
      </Reveal>,
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(loadScrollMotion).toHaveBeenCalled()
  })
})

describe('ActionLink', () => {
  it('opens external links in a new tab safely', () => {
    render(
      <ActionLink href="https://wa.me/1" external>
        Falar
      </ActionLink>,
    )
    const link = screen.getByRole('link', { name: 'Falar' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('keeps internal links in the same tab', () => {
    render(<ActionLink href="/blog">Blog</ActionLink>)
    const link = screen.getByRole('link', { name: 'Blog' })
    expect(link).toHaveAttribute('href', '/blog')
    expect(link).not.toHaveAttribute('target')
  })

  it('gives the quiet variant a 44 px tap target without changing the text', () => {
    render(
      <ActionLink href="/cv.pdf" variant="quiet" download>
        Currículo
      </ActionLink>,
    )
    expect(screen.getByRole('link', { name: 'Currículo' }).className).toContain('min-h-11')
  })

  it('answers the press on every variant', () => {
    render(<ActionLink href="/blog">Blog</ActionLink>)
    expect(screen.getByRole('link', { name: 'Blog' }).className).toMatch(/(^|\s)press(\s|$)/)
  })
})

describe('PhotoReveal', () => {
  it('renders a visible img with alt before motion loads', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    render(<PhotoReveal src="/photo.webp" alt="Ranielli" effect="mask" sizes="100vw" />)
    const img = screen.getByAltText('Ranielli') as HTMLImageElement
    expect(img.style.opacity).not.toBe('0')
    expect(img.style.clipPath).toBe('')
  })

  it('fetches a priority picture at high priority (case heroes, the featured post)', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<PhotoReveal src="/photo.webp" alt="Ranielli" effect="scale" sizes="100vw" priority />)
    const img = screen.getByAltText('Ranielli') as HTMLImageElement
    expect(img.getAttribute('fetchpriority')).toBe('high')
    expect(img.getAttribute('loading')).not.toBe('lazy')
  })
})

describe('SectionHeading', () => {
  it('renders kicker, an accessible h2 title and the lead', () => {
    render(<SectionHeading id="atto" kicker="a atto" title="Quem escala" lead="Texto" />)
    expect(screen.getByText('a atto')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Quem escala' })).toHaveAttribute(
      'id',
      'atto-title',
    )
    expect(screen.getByText('Texto')).toBeInTheDocument()
  })

  describe('ActionLink downloads', () => {
    it('renders a plain anchor with download for files', () => {
      render(
        <ActionLink href="/cv/en.pdf" download>
          CV
        </ActionLink>,
      )
      expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('download')
    })
  })
})
