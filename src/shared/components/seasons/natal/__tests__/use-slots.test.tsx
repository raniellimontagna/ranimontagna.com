import { act, render, screen } from '@testing-library/react'
import { useSlots } from '../use-slots'

function Probe() {
  const slots = useSlots('[data-season-slot="probe"]')
  return <output data-testid="count">{slots.length}</output>
}

afterEach(() => {
  for (const node of document.querySelectorAll('[data-season-slot="probe"]')) node.remove()
})

it('finds a slot that appears after mount and forgets it once removed', async () => {
  render(<Probe />)
  expect(screen.getByTestId('count')).toHaveTextContent('0')

  const slot = document.createElement('span')
  slot.dataset.seasonSlot = 'probe'
  await act(async () => {
    document.body.appendChild(slot)
  })
  expect(screen.getByTestId('count')).toHaveTextContent('1')

  await act(async () => {
    slot.remove()
  })
  expect(screen.getByTestId('count')).toHaveTextContent('0')
})

function Many() {
  useSlots('[data-a]')
  useSlots('[data-b]')
  useSlots('[data-c]')
  return null
}

it('shares one page observer between every slot lookup', async () => {
  const Observer = window.MutationObserver
  const created = vi.fn()
  window.MutationObserver = class extends Observer {
    constructor(callback: MutationCallback) {
      super(callback)
      created()
    }
  }
  const { unmount } = render(<Many />)
  await act(async () => {})
  expect(created).toHaveBeenCalledTimes(1)
  unmount()
  window.MutationObserver = Observer
})
