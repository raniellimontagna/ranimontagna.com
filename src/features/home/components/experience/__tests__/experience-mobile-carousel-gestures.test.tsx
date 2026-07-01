import { fireEvent, render } from '@/tests/test-utils'
import { ExperienceMobileCarouselGestures } from '../experience-mobile-carousel-gestures'

function setupMatchMedia(matches = true) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
}

function renderCarousel() {
  const view = render(
    <>
      <fieldset data-experience-mobile-carousel="true">
        {[0, 1, 2].map((index) => (
          <input
            key={index}
            id={`experience-mobile-${index}`}
            type="radio"
            name="experience-mobile-company"
            defaultChecked={index === 0}
            data-experience-mobile-input={index}
          />
        ))}

        {[0, 1, 2].map((index) => (
          <span
            key={`dot-${index}`}
            data-active={index === 0}
            data-experience-index={index}
            data-experience-mobile-dot="true"
          />
        ))}

        {[0, 1, 2].map((index) => (
          <span
            key={`slide-${index}`}
            data-active={index === 0}
            data-experience-index={index}
            data-experience-mobile-slide="true"
          />
        ))}

        <div
          data-testid="gesture-zone"
          data-experience-mobile-gesture-zone="true"
          data-experience-mobile-viewport="true"
        />
      </fieldset>

      <ExperienceMobileCarouselGestures />
    </>,
  )

  const fieldset = view.container.querySelector(
    '[data-experience-mobile-carousel="true"]',
  ) as HTMLElement
  const zone = view.getByTestId('gesture-zone')
  const inputs = [0, 1, 2].map(
    (index) =>
      view.container.querySelector(
        `[data-experience-mobile-input="${index}"]`,
      ) as HTMLInputElement,
  )

  return { ...view, fieldset, inputs, zone }
}

describe('ExperienceMobileCarouselGestures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMatchMedia()
  })

  it('changes the checked experience when the user swipes horizontally', () => {
    const { fieldset, inputs, zone } = renderCarousel()

    fireEvent.pointerDown(zone, { clientX: 320, clientY: 120, button: 0, pointerId: 1 })
    fireEvent.pointerUp(zone, { clientX: 210, clientY: 126, pointerId: 1 })

    expect(inputs[1]).toBeChecked()
    expect(fieldset).toHaveAttribute('data-experience-mobile-swipe-direction', 'next')

    fireEvent.pointerDown(zone, { clientX: 120, clientY: 120, button: 0, pointerId: 2 })
    fireEvent.pointerUp(zone, { clientX: 230, clientY: 124, pointerId: 2 })

    expect(inputs[0]).toBeChecked()
    expect(fieldset).toHaveAttribute('data-experience-mobile-swipe-direction', 'previous')
  })

  it('ignores mostly vertical drags so normal page scroll keeps working', () => {
    const { inputs, zone } = renderCarousel()

    fireEvent.pointerDown(zone, { clientX: 240, clientY: 120, button: 0, pointerId: 1 })
    fireEvent.pointerUp(zone, { clientX: 192, clientY: 260, pointerId: 1 })

    expect(inputs[0]).toBeChecked()
  })
})
