import { onTestFinished } from 'vitest'

/**
 * Makes web storage throw, as in a private window or with site data blocked, until the
 * current test ends. The test environment's storage is a plain object of `vi.fn`s, so
 * spying on `Storage.prototype` misses it and `vi.restoreAllMocks` would not undo a
 * spy on it: the original methods are put back by hand when the test finishes.
 */
export function blockStorage(storage: Storage = localStorage) {
  const methods = ['getItem', 'setItem', 'removeItem'] as const
  const originals = methods.map((method) => [method, storage[method]] as const)
  const fail = () => {
    throw new Error('blocked')
  }
  for (const method of methods)
    Object.defineProperty(storage, method, { configurable: true, writable: true, value: fail })
  onTestFinished(() => {
    for (const [method, original] of originals) {
      Object.defineProperty(storage, method, {
        configurable: true,
        writable: true,
        value: original,
      })
    }
  })
}
