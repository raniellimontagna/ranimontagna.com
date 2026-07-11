import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { ExperienceCylinderScroll } from '../experience-cylinder-scroll'

const gsapContextRevert = vi.fn()
const gsapContext = vi.fn((callback: () => void) => {
  callback()
  return { revert: gsapContextRevert }
})
const gsapFromTo = vi.fn()
const gsapSet = vi.fn()
const gsapTo = vi.fn(() => ({}))
const registerPlugin = vi.fn()
const scrollTriggerCreate = vi.fn((config: unknown) => {
  return { ...(config as object), end: 1000, start: 100 }
})
const scrollTriggerRefresh = vi.fn()

vi.mock('gsap', () => ({
  gsap: {
    context: gsapContext,
    fromTo: gsapFromTo,
    registerPlugin,
    set: gsapSet,
    to: gsapTo,
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: scrollTriggerCreate,
    refresh: scrollTriggerRefresh,
  },
}))

function setupMatchMedia() {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('min-width'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia
}

function StageFixture() {
  return (
    <div className="deferred-section">
      <div data-experience-cylinder-stage="true">
        <div data-experience-cylinder="true" />

        {[0, 1].map((index) => (
          <article
            key={`panel-${index}`}
            data-active={index === 0}
            data-experience-index={index}
            data-experience-panel="true"
          >
            <div data-experience-panel-mark="true" />
            <h3 data-experience-panel-heading="true">Role {index}</h3>
            <div data-experience-panel-meta="true">Company {index}</div>
            <p data-experience-panel-body="true">Description {index}</p>
            <div data-experience-panel-highlight="true">Highlight {index}</div>
            <span data-experience-panel-tech="true">Tech {index}</span>
          </article>
        ))}

        {[0, 1].map((index) => (
          <div
            key={`card-${index}`}
            data-active={index === 0}
            data-experience-cylinder-card="true"
            data-experience-index={index}
          />
        ))}

        <button
          type="button"
          aria-label="Luizalabs"
          data-experience-control="true"
          data-experience-index="0"
        >
          Luizalabs
        </button>
        <button
          type="button"
          aria-label="Smarten"
          data-experience-control="true"
          data-experience-index="1"
        >
          Smarten
        </button>
      </div>

      <ExperienceCylinderScroll />
    </div>
  )
}

describe('ExperienceCylinderScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMatchMedia()
    window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0)
      return 1
    }) as typeof window.requestAnimationFrame
    window.cancelAnimationFrame = vi.fn()
    window.scrollTo = vi.fn()
  })

  it('animates the selected desktop panel internals when the active experience changes', async () => {
    render(<StageFixture />)

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    gsapFromTo.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Smarten' }))

    expect(gsapFromTo).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(HTMLElement)]),
      expect.objectContaining({ autoAlpha: 0, y: 16 }),
      expect.objectContaining({
        autoAlpha: 1,
        ease: 'power3.out',
        stagger: 0.045,
        y: 0,
      }),
    )
  })
})
