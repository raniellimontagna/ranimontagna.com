import { onTestFinished } from 'vitest'

const METHODS = ['getItem', 'setItem', 'removeItem'] as const

/**
 * Makes web storage throw, as in a private window or with site data blocked, until the
 * current test ends. The test setup swaps localStorage for a plain object of `vi.fn`s, which
 * a spy on `Storage.prototype` never reaches and `vi.restoreAllMocks` would not undo, so
 * its methods are replaced on the instance. A real Storage (sessionStorage) treats a new
 * own property as an item, so for it the shared prototype is patched instead.
 */
export function blockStorage(storage: Storage = localStorage) {
  const target: object = storage instanceof Storage ? Storage.prototype : storage
  const originals = METHODS.map(
    (method) => [method, Object.getOwnPropertyDescriptor(target, method)] as const,
  )
  const fail = () => {
    throw new Error('blocked')
  }
  for (const method of METHODS) {
    Object.defineProperty(target, method, { configurable: true, writable: true, value: fail })
  }
  onTestFinished(() => {
    for (const [method, descriptor] of originals) {
      if (descriptor) Object.defineProperty(target, method, descriptor)
    }
  })
}
