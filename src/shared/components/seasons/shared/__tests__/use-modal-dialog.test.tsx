import { render } from '@testing-library/react'
import { useRef } from 'react'
import { useModalDialog } from '../use-modal-dialog'

const { stopSmoothScroll, startSmoothScroll } = vi.hoisted(() => ({
  stopSmoothScroll: vi.fn(),
  startSmoothScroll: vi.fn(),
}))
vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  stopSmoothScroll,
  startSmoothScroll,
}))

const showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute('open', '')
})
const close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute('open')
})
let seen: { current: boolean } | null = null

function Card({ open }: { open: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  seen = useModalDialog(ref, open)
  return <dialog ref={ref} aria-label="card" />
}

beforeEach(() => {
  Object.assign(HTMLDialogElement.prototype, { showModal, close })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('opens as a modal, pauses smooth scroll, and undoes both on close', () => {
  const { rerender } = render(<Card open />)
  expect(showModal).toHaveBeenCalledTimes(1)
  expect(stopSmoothScroll).toHaveBeenCalled()
  expect(seen?.current).toBe(true)

  rerender(<Card open={false} />)
  expect(close).toHaveBeenCalledTimes(1)
  expect(startSmoothScroll).toHaveBeenCalled()
  expect(seen?.current).toBe(false)
})

it('does nothing while closed', () => {
  render(<Card open={false} />)
  expect(showModal).not.toHaveBeenCalled()
  expect(stopSmoothScroll).not.toHaveBeenCalled()
})

// Like the season cards: the <dialog> leaves the DOM when closed, before the effect
// cleanup runs, so the browser no longer returns focus on its own.
function RemovedWhenClosed({ open }: { open: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useModalDialog(ref, open)
  return open ? (
    <dialog ref={ref} aria-label="card">
      <button type="button">inside</button>
    </dialog>
  ) : null
}

it('gives focus back to what opened it, even when the dialog leaves the DOM', () => {
  const { rerender } = render(
    <>
      <button type="button">opener</button>
      <RemovedWhenClosed open={false} />
    </>,
  )
  const opener = document.querySelector('button') as HTMLButtonElement
  opener.focus()
  rerender(
    <>
      <button type="button">opener</button>
      <RemovedWhenClosed open />
    </>,
  )
  ;(document.querySelector('dialog button') as HTMLButtonElement).focus()
  rerender(
    <>
      <button type="button">opener</button>
      <RemovedWhenClosed open={false} />
    </>,
  )
  expect(opener).toHaveFocus()
})
