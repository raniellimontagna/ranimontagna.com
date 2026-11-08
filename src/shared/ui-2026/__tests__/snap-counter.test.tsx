import { fireEvent, render } from '@/tests/test-utils'
import { SnapCounter } from '../snap-counter'

function Carousel({ count }: { count: number }) {
  return (
    <>
      <ul data-snap-test>
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>{index}</li>
        ))}
      </ul>
      <SnapCounter targetSelector="[data-snap-test]" total={count} />
    </>
  )
}

const counter = () => document.querySelector('[data-snap-counter]')
const list = () => document.querySelector('[data-snap-test]') as HTMLElement

function scroll(
  left: number,
  box: { itemWidth: number; scrollWidth?: number; clientWidth?: number },
) {
  const first = list().firstElementChild as HTMLElement
  Object.defineProperty(first, 'offsetWidth', { value: box.itemWidth, configurable: true })
  Object.defineProperty(list(), 'scrollWidth', { value: box.scrollWidth ?? 0, configurable: true })
  Object.defineProperty(list(), 'clientWidth', { value: box.clientWidth ?? 0, configurable: true })
  Object.defineProperty(list(), 'scrollLeft', { value: left, configurable: true })
  fireEvent.scroll(list())
}

describe('SnapCounter', () => {
  it('starts at the first item', () => {
    render(<Carousel count={6} />)
    expect(counter()).toHaveTextContent('01 / 06')
    expect(counter()).toHaveAttribute('aria-hidden', 'true')
  })

  it('follows the scroll by the width of one item', () => {
    render(<Carousel count={6} />)
    scroll(600, { itemWidth: 300, scrollWidth: 1800, clientWidth: 330 })
    expect(counter()).toHaveTextContent('03 / 06')
  })

  it('shows the last item once the scroll reaches the end', () => {
    render(<Carousel count={6} />)
    scroll(1470, { itemWidth: 300, scrollWidth: 1800, clientWidth: 330 })
    expect(counter()).toHaveTextContent('06 / 06')
  })

  it('reads 01 / 01 with a single item', () => {
    render(<Carousel count={1} />)
    scroll(0, { itemWidth: 300 })
    expect(counter()).toHaveTextContent('01 / 01')
  })

  it('fills a bar to (index + 1) / total', () => {
    render(<Carousel count={4} />)
    const fill = () => {
      const bar = document.querySelector('[data-snap-bar]') as HTMLElement
      return (bar.firstElementChild as HTMLElement).style.transform
    }
    expect(fill()).toBe('scaleX(0.25)')
    scroll(300, { itemWidth: 300, scrollWidth: 1200, clientWidth: 300 })
    expect(fill()).toBe('scaleX(0.5)')
  })
})
